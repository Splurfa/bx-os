import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { action = 'logout_user', userId, sessionId } = body as {
      action?: 'logout_user' | 'logout_session'
      userId?: string
      sessionId?: string
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify caller is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userErr } = await adminClient.auth.getUser(jwt)
    if (userErr || !user) throw new Error('Invalid auth token')

    // Get caller's role
    const { data: callerProfile, error: callerErr } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    if (callerErr) throw callerErr
    if (!callerProfile?.role || !['admin', 'super_admin'].includes(callerProfile.role)) {
      throw new Error('Unauthorized: admin or super_admin role required')
    }

    if (action === 'logout_session') {
      if (!sessionId) throw new Error('sessionId is required for logout_session')

      // Mark the session as ended in our DB
      await adminClient.rpc('end_user_session', { p_session_id: sessionId })

      return new Response(
        JSON.stringify({ success: true, message: 'Session ended' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default: logout_user (revoke tokens for the user and end active sessions records)
    if (!userId) throw new Error('userId is required for logout_user')

    // Get target user's role for permission checking
    const { data: targetProfile, error: targetErr } = await adminClient
      .from('profiles')
      .select('role, full_name')
      .eq('id', userId)
      .single()
    if (targetErr) throw new Error('Target user not found or inaccessible')

    // Check permission hierarchy
    const canForceLogout = (callerRole: string, targetRole: string) => {
      // Teachers cannot force logout anyone
      if (callerRole === 'teacher') return false;
      // Admins can only force logout teachers
      if (callerRole === 'admin' && targetRole === 'teacher') return true;
      // Super admins can force logout teachers and admins
      if (callerRole === 'super_admin' && (targetRole === 'teacher' || targetRole === 'admin')) return true;
      return false;
    }

    if (!canForceLogout(callerProfile.role, targetProfile.role)) {
      console.log(`Permission denied: ${callerProfile.role} cannot force logout ${targetProfile.role}`)
      throw new Error(`Permission denied: ${callerProfile.role} users cannot force logout ${targetProfile.role} users`)
    }

    console.log(`Force logout initiated: ${callerProfile.full_name} (${callerProfile.role}) logging out ${targetProfile.full_name} (${targetProfile.role})`)

    // Attempt to revoke user tokens across devices (compatibility with different supabase-js versions)
    let revokeFailedMessage: string | null = null;
    try {
      const anyClient: any = adminClient as any;
      if (anyClient?.auth?.admin?.signOut) {
        const { error } = await anyClient.auth.admin.signOut(userId);
        if (error) revokeFailedMessage = error.message;
      } else if (anyClient?.auth?.admin?.invalidateRefreshTokens) {
        const { error } = await anyClient.auth.admin.invalidateRefreshTokens(userId);
        if (error) revokeFailedMessage = error.message;
      } else {
        revokeFailedMessage = 'Admin token revocation method not available in this SDK version';
      }
    } catch (e: any) {
      revokeFailedMessage = e?.message ?? String(e);
    }
    if (revokeFailedMessage) {
      console.warn('Token revocation warning:', revokeFailedMessage);
      // Continue to mark sessions ended so UI updates; clients will drop on next refresh
    }

    // Soft end all active/idle sessions for this user in our table
    const { error: sessionUpdateError } = await adminClient
      .from('user_sessions')
      .update({ session_status: 'ended', ended_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('session_status', ['active', 'idle'])

    if (sessionUpdateError) {
      console.error('Failed to update session status:', sessionUpdateError)
      throw new Error('Failed to end user sessions in database')
    }

    // Log the force logout action for audit purposes
    await adminClient
      .from('user_sessions')
      .insert({
        user_id: user.id,
        device_type: 'admin_action',
        device_info: {
          action: 'force_logout',
          target_user_id: userId,
          target_user_name: targetProfile.full_name,
          target_user_role: targetProfile.role,
          caller_role: callerProfile.role,
          timestamp: new Date().toISOString()
        },
        location: 'Admin Force Logout',
        session_status: 'audit_log'
      })

    console.log(`Force logout completed: ${targetProfile.full_name} (${targetProfile.role}) logged out by ${callerProfile.full_name} (${callerProfile.role})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${targetProfile.full_name} has been forcibly logged out`,
        target_user: targetProfile.full_name,
        target_role: targetProfile.role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('force-logout error:', err)
    return new Response(
      JSON.stringify({ success: false, error: err?.message ?? 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

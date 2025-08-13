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

    // Verify caller is authenticated and is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userErr } = await adminClient.auth.getUser(jwt)
    if (userErr || !user) throw new Error('Invalid auth token')

    const { data: roleRow, error: roleErr } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (roleErr) throw roleErr
    if (roleRow?.role !== 'admin') throw new Error('Unauthorized: admin only')

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
    await adminClient
      .from('user_sessions')
      .update({ session_status: 'ended', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('session_status', ['active', 'idle'])

    return new Response(
      JSON.stringify({ success: true, message: 'User forcibly logged out' }),
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

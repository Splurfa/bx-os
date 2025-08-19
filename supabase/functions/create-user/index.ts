import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create client for user verification using anon key
    const anonSupabase = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!, 
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Set the auth header for the anon client
    const { data: { user }, error: userError } = await anonSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    
    if (userError || !user) {
      throw new Error('Invalid authentication token')
    }

    // Check if user is super admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'super_admin') {
      throw new Error('Unauthorized: Super Admin access required')
    }

    const requestData = await req.json()
    const { action } = requestData

    if (action === 'delete') {
      const { userId } = requestData
      
      if (!userId) {
        throw new Error('Missing userId for delete action')
      }

      // Delete the user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)

      if (deleteError) {
        console.error('Failed to delete user:', deleteError)
        throw new Error(`Failed to delete user: ${deleteError.message}`)
      }

      console.log(`Admin ${user.email} deleted user: ${userId}`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User deleted successfully'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Default to create user
      const { email, password, firstName, lastName, role } = requestData

      if (!email || !password || !firstName || !lastName || !role) {
        throw new Error('Missing required fields: email, password, firstName, lastName, role')
      }

      const fullName = `${firstName} ${lastName}`.trim()

      // Create the user with explicit confirmation
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          role: role,
          email_verified: true
        },
        email_confirm: true,
        email_confirmed_at: new Date().toISOString()
      })

      if (createError) {
        console.error('User creation failed:', createError)
        throw new Error(`Failed to create user: ${createError.message}`)
      }

      if (!newUser || !newUser.user) {
        throw new Error('User creation returned no user data')
      }

      console.log(`Admin ${user.email} created new user: ${email} with role: ${role} (ID: ${newUser.user.id})`)

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: {
            id: newUser.user.id,
            email: newUser.user.email,
            full_name: fullName,
            role: role
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error creating user:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
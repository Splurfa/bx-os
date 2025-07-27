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
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      throw new Error('Invalid token')
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
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
      const { email, password, fullName, role } = requestData

      if (!email || !password || !fullName || !role) {
        throw new Error('Missing required fields: email, password, fullName, role')
      }

      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName,
          role: role
        },
        email_confirm: true // Auto-confirm email for admin-created users
      })

      if (createError) {
        throw createError
      }

      console.log(`Admin ${user.email} created new user: ${email} with role: ${role}`)

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
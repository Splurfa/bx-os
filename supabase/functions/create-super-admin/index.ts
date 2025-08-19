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
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const requestData = await req.json()
    const { email, password, firstName, lastName } = requestData

    if (!email || !password || !firstName || !lastName) {
      throw new Error('Missing required fields: email, password, firstName, lastName')
    }

    // Check if any super admin already exists
    const { data: existingSuperAdmins, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing super admins:', checkError)
      throw new Error('Failed to verify super admin status')
    }

    // Only allow creation if no super admin exists yet
    if (existingSuperAdmins && existingSuperAdmins.length > 0) {
      throw new Error('Super admin already exists. Use the regular user management system.')
    }

    const fullName = `${firstName} ${lastName}`.trim()

    console.log(`Creating initial super admin account: ${email}`)

    // Create the super admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        role: 'super_admin',
        email_verified: true
      },
      email_confirm: true,
      email_confirmed_at: new Date().toISOString()
    })

    if (createError) {
      console.error('Super admin creation failed:', createError)
      throw new Error(`Failed to create super admin: ${createError.message}`)
    }

    if (!newUser || !newUser.user) {
      throw new Error('Super admin creation returned no user data')
    }

    console.log(`Successfully created initial super admin: ${email} (ID: ${newUser.user.id})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin account created successfully',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: fullName,
          role: 'super_admin'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating super admin:', error)
    
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
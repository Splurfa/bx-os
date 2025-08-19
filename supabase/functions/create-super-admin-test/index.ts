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

    console.log('Creating test super admin account: superadmin@school.edu')

    // Create the test super admin user with predefined credentials
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'superadmin@school.edu',
      password: 'password123',
      user_metadata: {
        full_name: 'Super Administrator',
        first_name: 'Super',
        last_name: 'Administrator',
        role: 'super_admin',
        email_verified: true
      },
      email_confirm: true,
      email_confirmed_at: new Date().toISOString()
    })

    if (createError) {
      console.error('Test super admin creation failed:', createError)
      throw new Error(`Failed to create test super admin: ${createError.message}`)
    }

    if (!newUser || !newUser.user) {
      throw new Error('Test super admin creation returned no user data')
    }

    console.log(`Successfully created test super admin: superadmin@school.edu (ID: ${newUser.user.id})`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test super admin account created successfully',
        credentials: {
          email: 'superadmin@school.edu',
          password: 'password123'
        },
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: 'Super Administrator',
          role: 'super_admin'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error creating test super admin:', error)
    
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
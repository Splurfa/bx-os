import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Creating demo accounts...');

    // Create admin account
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@school.edu',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      }
    });

    if (adminError) {
      console.error('Admin creation error:', adminError);
    } else {
      console.log('Admin user created:', adminUser.user?.id);
      
      // Create admin profile
      const { error: adminProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: adminUser.user.id,
          email: 'admin@school.edu',
          full_name: 'Admin User',
          role: 'admin'
        });
      
      if (adminProfileError) {
        console.error('Admin profile error:', adminProfileError);
      }
    }

    // Create teacher account
    const { data: teacherUser, error: teacherError } = await supabaseAdmin.auth.admin.createUser({
      email: 'teacher@school.edu',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Teacher User',
        role: 'teacher'
      }
    });

    if (teacherError) {
      console.error('Teacher creation error:', teacherError);
    } else {
      console.log('Teacher user created:', teacherUser.user?.id);
      
      // Create teacher profile
      const { error: teacherProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: teacherUser.user.id,
          email: 'teacher@school.edu',
          full_name: 'Teacher User',
          role: 'teacher',
          classroom: 'Room 101',
          grade_level: '3rd Grade'
        });
      
      if (teacherProfileError) {
        console.error('Teacher profile error:', teacherProfileError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo accounts created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
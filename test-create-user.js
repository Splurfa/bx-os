// Test the fixed create-user edge function
const testUserCreation = async () => {
  try {
    const response = await fetch('https://tuxvwpgwnnozubdpskhr.supabase.co/functions/v1/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IlZ0V3AycURyc3NydmVFdEciLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1MzMwOTc1LCJpYXQiOjE3NTUzMjczNzUsImlzcyI6Imh0dHBzOi8vdHV4dndwZ3dubm96dWJkcHNraHIuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjljZDgyYmFmLTcyMDEtNDhmYi1iOTVhLWU3YzI2YTU5OTMzZSIsImVtYWlsIjoiYWRtaW5Ac2Nob29sLmVkdSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzU1MzI3Mzc1fV0sInNlc3Npb25faWQiOiJjMTViMGM5ZC1jNmJkLTQ4NzEtOThmMi1iNmJmZmZmNGJkODAiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.BcdM0UfvD8y3PwYdOuWMvAyMV9hYfF7kJF_GvZoMnVo'
      },
      body: JSON.stringify({
        email: 'tinytim@school.edu',
        password: 'password123',
        firstName: 'Tiny',
        lastName: 'Tim',
        role: 'teacher'
      })
    });

    const result = await response.json();
    console.log('Create user result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: User created successfully');
      // Try login immediately
      const loginResponse = await fetch('https://tuxvwpgwnnozubdpskhr.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHZ3cGd3bm5venViZHBza2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODk3NjgsImV4cCI6MjA2OTA2NTc2OH0.zukCQDiwyIfRKujGWwzLUkIsgv3RM3b8WtjdNWjHqnw'
        },
        body: JSON.stringify({
          email: 'tinytim@school.edu',
          password: 'password123'
        })
      });
      
      const loginResult = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('✅ SUCCESS: Login worked immediately!');
        console.log('Login result:', loginResult);
      } else {
        console.log('❌ FAILED: Login still failed');
        console.log('Login error:', loginResult);
      }
    } else {
      console.log('❌ FAILED: User creation failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.log('❌ FAILED: Network error');
    console.log('Error:', error);
  }
};

testUserCreation();
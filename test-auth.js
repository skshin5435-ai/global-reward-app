const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aovnhxhtaixeswmkwxni.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdm5oeGh0YWl4ZXN3bWt3eG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTUzNzYsImV4cCI6MjA4OTk3MTM3Nn0.7Ga4r4tuMIE5pHa3_UiHCqZ1pqEM1OkdT16tdqzpUsk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const email = 'demo_admin@nxsweets.com';
  console.log('Testing SignIn with', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: 'Password123!',
  });
  if (error) {
    console.error('SIGNIN ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SIGNIN SUCCESS:', !!data.session);
  }
}

test();

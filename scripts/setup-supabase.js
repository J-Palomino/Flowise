const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// These values would normally be provided by the user
// For this example, we'll use placeholder values that should be replaced
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_KEY = 'your-supabase-service-role-key';
const SUPABASE_PASSWORD = 'your-database-password';

function setupSupabase() {
  console.log('Setting up Supabase connection...');
  
  // Extract the host from the URL
  const url = new URL(SUPABASE_URL);
  const host = url.hostname;
  
  // Create .env file with Supabase connection details
  const envContent = `# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=${host}
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=${SUPABASE_PASSWORD}
DATABASE_SSL=true

# Server Configuration
PORT=12000
CORS_ORIGIN=*
IFRAME_ORIGINS=*`;

  fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
  console.log('.env file created with Supabase connection details');
  
  // Test the connection
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  console.log('To test the connection, replace the placeholder values in this script with your actual Supabase credentials and run it again.');
  console.log('Instructions for getting Supabase credentials:');
  console.log('1. Go to https://supabase.com and sign in to your account');
  console.log('2. Select your project');
  console.log('3. Go to Project Settings > API');
  console.log('4. Copy the "Project URL" and use it as SUPABASE_URL');
  console.log('5. Copy the "service_role key" (not the anon key) and use it as SUPABASE_KEY');
  console.log('6. For the database password, go to Project Settings > Database');
  console.log('7. Find the "Database Password" section and use that password as SUPABASE_PASSWORD');
}

setupSupabase();
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL or SUPABASE_KEY not found in environment variables');
    console.log('Please update the .env file with your Supabase credentials');
    return;
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // First, try a simple health check
    console.log('Checking Supabase connection...');
    const { error: healthError } = await supabase.auth.getSession();
    
    if (healthError) {
      console.error('Error with Supabase health check:', healthError);
      return;
    }
    
    console.log('Supabase health check passed!');
    console.log('Successfully connected to Supabase API!');
    
    // Now test the direct PostgreSQL connection
    console.log('\nTesting PostgreSQL connection...');
    console.log('Database connection parameters:');
    console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
    console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
    console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
    console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
    console.log('DATABASE_USER:', process.env.DATABASE_USER);
    console.log('DATABASE_SSL:', process.env.DATABASE_SSL);
    
    // Try to connect directly to PostgreSQL
    try {
      const pgClient = new Client({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
      });
      
      await pgClient.connect();
      console.log('Successfully connected to PostgreSQL!');
      
      // Query to list tables
      const res = await pgClient.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      
      console.log('Tables in database:', res.rows.map(row => row.table_name));
      
      await pgClient.end();
    } catch (pgError) {
      console.error('Error connecting to PostgreSQL:', pgError.message);
    }
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
}

testSupabaseConnection();
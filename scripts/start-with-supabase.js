const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Start Flowise with Supabase database
function startFlowiseWithSupabase() {
  console.log('Daisy chaining with Supabase database...');
  
  // Check if required environment variables are set
  const requiredEnvVars = [
    'DATABASE_TYPE',
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_NAME',
    'DATABASE_USER',
    'DATABASE_PASSWORD'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please run setup-supabase.js first to configure the database connection.');
    process.exit(1);
  }
  
  // Start Flowise
  const flowiseProcess = spawn('pnpm', ['start'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
  });
  
  flowiseProcess.on('error', (error) => {
    console.error('Error starting Daisy:', error);
  });
  
  flowiseProcess.on('close', (code) => {
    console.log(`Daisy process exited with code ${code}`);
  });
}

// Run the start script
startFlowiseWithSupabase();
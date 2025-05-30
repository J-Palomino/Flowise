const { createClient } = require('@supabase/supabase-js');
const { getDataSource } = require('../packages/server/dist/DataSource');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Initialize the database schema in Supabase
async function initSupabaseSchema() {
  try {
    console.log('Initializing Supabase database schema...');
    
    // Initialize the data source
    const dataSource = getDataSource();
    
    // Connect to the database
    await dataSource.initialize();
    console.log('Connected to the database');
    
    // Run migrations
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');
    
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database schema:', error);
  }
}

// Make sure the .env file exists
if (!fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.error('Error: .env file not found. Please run setup-supabase.js first.');
  process.exit(1);
}

// Run the initialization
initSupabaseSchema();
const { DataSource } = require('typeorm');
const path = require('path');
const fs = require('fs');
const { getUserHome } = require('../packages/server/dist/utils');
const { entities } = require('../packages/server/dist/database/entities');
const { postgresMigrations } = require('../packages/server/dist/database/migrations/postgres');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Function to get SQLite data source
function getSqliteDataSource() {
  const homePath = path.join(getUserHome(), '.flowise');
  return new DataSource({
    type: 'sqlite',
    database: path.resolve(homePath, 'database.sqlite'),
    entities: Object.values(entities),
    synchronize: false
  });
}

// Function to get Postgres data source
function getPostgresDataSource() {
  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.DATABASE_SSL === 'true' ? true : undefined,
    entities: Object.values(entities),
    migrations: postgresMigrations,
    synchronize: false
  });
}

// Function to migrate data from SQLite to Postgres
async function migrateToSupabase() {
  console.log('Starting migration from SQLite to Supabase...');
  
  let sqliteDataSource;
  let postgresDataSource;
  
  try {
    // Initialize SQLite data source
    sqliteDataSource = getSqliteDataSource();
    await sqliteDataSource.initialize();
    console.log('Connected to SQLite database');
    
    // Initialize Postgres data source
    postgresDataSource = getPostgresDataSource();
    await postgresDataSource.initialize();
    console.log('Connected to Postgres database');
    
    // Run migrations on Postgres
    await postgresDataSource.runMigrations();
    console.log('Migrations completed successfully on Postgres');
    
    // Get all entity names
    const entityNames = Object.keys(entities);
    
    // Migrate each entity
    for (const entityName of entityNames) {
      try {
        console.log(`Migrating ${entityName}...`);
        
        // Get the entity from SQLite
        const sqliteRepository = sqliteDataSource.getRepository(entities[entityName]);
        const records = await sqliteRepository.find();
        
        if (records.length === 0) {
          console.log(`No records found for ${entityName}, skipping...`);
          continue;
        }
        
        console.log(`Found ${records.length} records for ${entityName}`);
        
        // Insert into Postgres
        const postgresRepository = postgresDataSource.getRepository(entities[entityName]);
        
        // Clear existing data in Postgres (optional, comment out if you want to keep existing data)
        await postgresRepository.clear();
        
        // Insert records in batches to avoid memory issues
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          await postgresRepository.save(batch);
          console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} for ${entityName}`);
        }
        
        console.log(`Successfully migrated ${records.length} records for ${entityName}`);
      } catch (error) {
        console.error(`Error migrating ${entityName}:`, error);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close connections
    if (sqliteDataSource && sqliteDataSource.isInitialized) {
      await sqliteDataSource.destroy();
    }
    if (postgresDataSource && postgresDataSource.isInitialized) {
      await postgresDataSource.destroy();
    }
  }
}

// Make sure the .env file exists
if (!fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.error('Error: .env file not found. Please create it with your Supabase credentials.');
  process.exit(1);
}

// Run the migration
migrateToSupabase();
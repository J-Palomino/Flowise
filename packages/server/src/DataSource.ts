import 'reflect-metadata'
import path from 'path'
import * as fs from 'fs'
import { DataSource } from 'typeorm'
import { getUserHome } from './utils'
import { entities } from './database/entities'
import { sqliteMigrations } from './database/migrations/sqlite'
import { mysqlMigrations } from './database/migrations/mysql'
import { mariadbMigrations } from './database/migrations/mariadb'
import { postgresMigrations } from './database/migrations/postgres'
import dotenv from 'dotenv'

// Add debugging for environment variables
console.log('Current working directory:', process.cwd())
const envPath = path.join(__dirname, '..', '..', '.env')
console.log('Looking for .env file at:', envPath)
console.log('.env file exists:', fs.existsSync(envPath))

// Try to load .env file from the root directory
const rootEnvPath = path.join(process.cwd(), '.env')
console.log('Looking for .env file at root:', rootEnvPath)
console.log('Root .env file exists:', fs.existsSync(rootEnvPath))

// Try to manually load the .env file from the root directory
if (fs.existsSync(rootEnvPath)) {
    console.log('Loading .env file from root directory')
    dotenv.config({ path: rootEnvPath, override: true })
}

let appDataSource: DataSource

// Move this function up to fix the lint errors
const getDatabaseSSLFromEnv = () => {
    if (process.env.DATABASE_SSL_KEY_BASE64) {
        return {
            rejectUnauthorized: false,
            ca: Buffer.from(process.env.DATABASE_SSL_KEY_BASE64, 'base64')
        }
    } else if (process.env.DATABASE_SSL === 'true') {
        return true
    }
    return undefined
}

export const init = async (): Promise<void> => {
    try {
        let homePath
        let flowisePath = path.join(getUserHome(), '.flowise')
        if (!fs.existsSync(flowisePath)) {
            fs.mkdirSync(flowisePath)
        }
        
        // Log all database configuration parameters
        console.log('\n🔍 DATABASE CONNECTION PARAMETERS:')
        console.log('Database Type:', process.env.DATABASE_TYPE)
        console.log('Database Host:', process.env.DATABASE_HOST)
        console.log('Database Port:', process.env.DATABASE_PORT)
        console.log('Database Name:', process.env.DATABASE_NAME)
        console.log('Database User:', process.env.DATABASE_USER)
        console.log('Database Password:', process.env.DATABASE_PASSWORD ? '******' : 'Not set')
        console.log('Database SSL:', process.env.DATABASE_SSL)
        console.log('Database URL:', process.env.DATABASE_URL ? '******' : 'Not set')
        console.log('Supabase URL:', process.env.SUPABASE_URL || 'Not set')
        console.log('Supabase Key:', process.env.SUPABASE_KEY ? '******' : 'Not set')
        console.log('Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '******' : 'Not set')
        switch (process.env.DATABASE_TYPE) {
        case 'sqlite':
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
        case 'mysql':
            appDataSource = new DataSource({
                type: 'mysql',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mysqlMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'mariadb':
            appDataSource = new DataSource({
                type: 'mariadb',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '3306'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                charset: 'utf8mb4',
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: mariadbMigrations,
                ssl: getDatabaseSSLFromEnv()
            })
            break
        case 'postgres':
            console.log('\n🔌 Setting up PostgreSQL connection to:', process.env.DATABASE_HOST)
            const sslConfig = getDatabaseSSLFromEnv()
            console.log('SSL Configuration:', sslConfig ? (typeof sslConfig === 'boolean' ? 'Enabled' : 'Custom SSL Config') : 'Disabled')
            
            appDataSource = new DataSource({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT || '5432'),
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                ssl: sslConfig,
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: postgresMigrations
            })
            console.log('PostgreSQL DataSource configured, attempting connection...')
            break
        default:
            homePath = process.env.DATABASE_PATH ?? flowisePath
            appDataSource = new DataSource({
                type: 'sqlite',
                database: path.resolve(homePath, 'database.sqlite'),
                synchronize: false,
                migrationsRun: false,
                entities: Object.values(entities),
                migrations: sqliteMigrations
            })
            break
        }
        // After configuring the DataSource, attempt to initialize it
        if (appDataSource) {
            console.log('\n🔄 Attempting to initialize database connection...')
            try {
                await appDataSource.initialize()
                console.log('\n✅ Database connection established successfully!')
            } catch (initError) {
                console.error('\n❌ Failed to initialize database connection:', initError)
                if (initError instanceof Error) {
                    console.error('Error name:', initError.name)
                    console.error('Error message:', initError.message)
                    
                    // Check for common connection errors
                    if (initError.message.includes('ECONNREFUSED')) {
                        console.error('\n🚫 Connection refused! This typically means:')
                        console.error('  - The database server is not running or not accessible')
                        console.error('  - There might be a firewall blocking the connection')
                        console.error('  - The host or port might be incorrect')
                        console.error('  - For Supabase: Check if your project is active and accessible')
                    } else if (initError.message.includes('password authentication failed')) {
                        console.error('\n🔑 Authentication failed! This typically means:')
                        console.error('  - The username or password is incorrect')
                        console.error('  - For Supabase: Check your database credentials')
                    } else if (initError.message.includes('SSL')) {
                        console.error('\n🔒 SSL connection error! This typically means:')
                        console.error('  - SSL is required but not properly configured')
                        console.error('  - For Supabase: Make sure DATABASE_SSL=true is set')
                    }
                }
                throw initError
            }
        }
    } catch (error) {
        console.error('\n❌ Database configuration error:', error)
        if (error instanceof Error) {
            console.error('Error name:', error.name)
            console.error('Error message:', error.message)
            console.error('Error stack:', error.stack)
        }
        throw error
    }
}

export function getDataSource(): DataSource {
    if (appDataSource === undefined) {
        console.log('\n🔄 Initializing database connection...')
        init()
    }
    return appDataSource
}

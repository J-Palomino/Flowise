# Connecting Flowise to Supabase

This guide explains how to connect your Flowise application to a Supabase PostgreSQL database.

## Prerequisites

1. A Supabase account and project
2. Flowise application

## Setup Instructions

### 1. Get Supabase Connection Details

1. Go to [Supabase](https://supabase.com) and sign in to your account
2. Select your project
3. Go to Project Settings > API
4. Copy the "Project URL" (e.g., https://abcdefghijklm.supabase.co)
5. Copy the "service_role key" (not the anon key)
6. Go to Project Settings > Database
7. Find the "Database Password" section and note your database password

### 2. Configure Flowise

#### Option 1: Using the Setup Script

1. Edit the `scripts/setup-supabase.js` file and replace the placeholder values:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key
   - `SUPABASE_PASSWORD`: Your Supabase database password

2. Run the setup script:
   ```bash
   node scripts/setup-supabase.js
   ```

#### Option 2: Manual Configuration

Create a `.env` file in the root of your Flowise project with the following content:

```
# Database Configuration
DATABASE_TYPE=postgres
DATABASE_HOST=db.your-project-id.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your-database-password
DATABASE_SSL=true

# Server Configuration
PORT=12000
CORS_ORIGIN=*
IFRAME_ORIGINS=*
```

Replace:
- `your-project-id` with your Supabase project ID (from the hostname of your project URL)
- `your-database-password` with your Supabase database password

### 3. Start Flowise

After configuring the database connection, start Flowise:

```bash
pnpm start
```

## Troubleshooting

If you encounter connection issues:

1. Verify that your database password is correct
2. Check that the DATABASE_HOST is in the format `db.your-project-id.supabase.co`
3. Ensure that DATABASE_SSL is set to `true`
4. Check if your IP address is allowed in Supabase's Database settings

## Additional Configuration

For production environments, you may want to set additional environment variables:

```
# Security
APIKEY_PATH=/path/to/apikeys.json
SECRETKEY_PATH=/path/to/secrets.json

# Logging
LOG_LEVEL=info
LOG_PATH=/path/to/logs

# Performance
EXECUTION_MODE=child
```

Refer to the Flowise documentation for more configuration options.
# Deploying Flowise to Railway

This guide will help you deploy Flowise to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. Git installed on your local machine
3. The Railway CLI (optional)

## Deployment Steps

### Option 1: Deploy via Railway Dashboard

1. Fork this repository to your GitHub account
2. Log in to your Railway account
3. Click on "New Project"
4. Select "Deploy from GitHub repo"
5. Choose the forked repository
6. Railway will automatically detect the `railway.json` file and use the configuration

### Option 2: Deploy via Railway CLI

1. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Deploy the application:
   ```bash
   railway up
   ```

## Environment Variables

Configure the following environment variables in your Railway project settings:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_TYPE` | Database type (sqlite, mysql, postgres) | sqlite |
| `DATABASE_URL` | Database connection URL | file:./database.sqlite |
| `JWT_SECRET` | Secret for JWT token generation | *random string* |
| `DAISY_USERNAME` | Admin username | admin |
| `DAISY_PASSWORD` | Admin password | password |
| `DAISY_API_KEY` | API key for authentication (optional) | |
| `CORS_ORIGIN` | CORS origin | * |
| `IFRAME_ORIGINS` | Allowed origins for iframe embedding | * |
| `SUPABASE_URL` | Supabase URL | |
| `SUPABASE_KEY` | Supabase API key | |
| `REDIS_URL` | Redis URL for rate limiting and queue (optional) | |
| `REDIS_PASSWORD` | Redis password (optional) | |
| `MODE` | Server mode (optional) | |
| `ENABLE_QUEUE` | Enable queue mode for high throughput | false |
| `QUEUE_CONCURRENCY` | Number of concurrent queue workers | 5 |
| `ENABLE_METRICS` | Enable metrics | false |
| `METRICS_PROVIDER` | Metrics provider (prometheus) | prometheus |
| `LOG_LEVEL` | Logging level | info |
| `LOG_PATH` | Path to store logs | logs/ |
| `GLOBAL_PROXY_URL` | Global proxy URL (optional) | |
| `NUMBER_OF_PROXIES` | Number of proxies (optional) | 0 |

## Persistent Storage

Railway provides persistent storage for your application. For Flowise, the following paths are important:

- `/app/database.sqlite`: SQLite database file (if using SQLite)
- `/app/logs`: Log files
- `/app/storage`: Storage for uploaded files

## Scaling

To scale your application, you can adjust the following in your Railway project settings:

1. Memory allocation
2. CPU allocation
3. Number of replicas (in the `railway.json` file)

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Railway logs for error messages
2. Verify that all required environment variables are set correctly
3. Ensure your database connection is working properly
4. Check the health endpoint at `/api/v1/health`

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Flowise Documentation](https://docs.flowiseai.com/)
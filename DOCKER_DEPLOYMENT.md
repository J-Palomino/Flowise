# Docker Deployment Guide

This guide explains how to deploy Flowise using Docker with branch-specific images.

## Branch-Specific Docker Images

For each branch in the repository, a Docker image is automatically built and pushed to Docker Hub with the following tags:
- `flowiseai/flowise:<branch-name>` - Latest build from the branch
- `flowiseai/flowise:<branch-name>-<commit-sha>` - Specific commit build

## Deploying with Docker Compose

### Using the Branch-Specific Image

1. Create a `.env` file with your configuration:

```
# Branch name to use (defaults to refactor-ux if not specified)
BRANCH_NAME=refactor-ux

# Supabase Configuration
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

2. Run the Docker Compose file:

```bash
docker-compose -f docker-compose.branch.yml up -d
```

This will start Flowise using the Docker image built from the specified branch.

### Environment Variables

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | The port to run the server on | 12000 |
| DAISY_USERNAME | Admin username | admin |
| DAISY_PASSWORD | Admin password | password |
| DATABASE_TYPE | Database type (sqlite, mysql, postgres) | sqlite |
| DATABASE_URL | Database connection URL | file:./database.sqlite |
| CORS_ORIGIN | CORS origin | * |
| IFRAME_ORIGINS | Allowed origins for iframe embedding | * |
| SUPABASE_URL | Supabase project URL | |
| SUPABASE_KEY | Supabase API key | |

## Building Locally

If you want to build the Docker image locally:

```bash
docker build -t flowiseai/flowise:local -f docker/Dockerfile.source .
```

Then run it:

```bash
docker run -p 12000:12000 -e SUPABASE_URL=your-url -e SUPABASE_KEY=your-key flowiseai/flowise:local
```
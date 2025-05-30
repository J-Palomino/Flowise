#!/bin/bash

# Script to deploy Flowise to Railway

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI is not installed. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway if not already logged in
railway whoami || railway login

# Check if the project is linked
if ! railway status &> /dev/null; then
    echo "Project not linked. Linking..."
    railway link
fi

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Set environment variables
echo "Setting environment variables..."
railway variables set \
    JWT_SECRET="$JWT_SECRET" \
    DATABASE_TYPE="sqlite" \
    DATABASE_URL="file:./database.sqlite" \
    DAISY_USERNAME="admin" \
    DAISY_PASSWORD="password" \
    CORS_ORIGIN="*" \
    IFRAME_ORIGINS="*" \
    LOG_LEVEL="info"

# Deploy the application
echo "Deploying to Railway..."
railway up

echo "Deployment complete!"
echo "Your application should be available at the Railway-provided URL."
echo "Check the Railway dashboard for the URL and deployment status."
#!/bin/bash
echo "Setting up Hyperlocal Ad Optimizer for deployment..."

# Ensure directories exist
mkdir -p dist/public

# Copy our HTML interface to the deployment location
if [ -f "client/dist/index.html" ]; then
    echo "Copying HTML interface files..."
    cp -r client/dist/* dist/public/
    echo "Files copied successfully"
else
    echo "Error: HTML interface not found"
    exit 1
fi

# Build the server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Start the server
echo "Starting production server..."
export NODE_ENV=production
node dist/index.js
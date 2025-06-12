#!/bin/bash
cd /home/runner/workspace
export NODE_ENV=development
export PORT=5000

echo "Starting Hyperlocal Ad Optimizer server..."
tsx server/simple-server.ts
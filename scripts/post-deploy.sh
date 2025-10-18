#!/bin/bash

echo "🚀 Running post-deployment migrations..."

# Wait a moment for the app to start
sleep 10

# Run migrations
yarn prisma migrate deploy

echo "✅ Migrations completed!"

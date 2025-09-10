#!/bin/bash

echo "🚀 Starting production deployment..."

# Check if all required environment variables are set
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "OPENAI_API_KEY" "STRIPE_SECRET_KEY")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Error: $var is not set"
    exit 1
  fi
done

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building application..."
npm run build

# Run health check
echo "🏥 Running health check..."
curl -f http://localhost:3000/api/health || exit 1

echo "✅ Deployment completed successfully!"

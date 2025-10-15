#!/bin/bash

# Database Migration Helper Script
# Usage: ./scripts/migrate.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

case "${1:-help}" in
  status)
    echo "📊 Checking migration status..."
    npx prisma migrate status
    ;;
    
  create)
    if [ -z "$2" ]; then
      echo "❌ Error: Migration name required"
      echo "Usage: ./scripts/migrate.sh create <migration_name>"
      exit 1
    fi
    echo "📝 Creating migration: $2"
    npx prisma migrate dev --name "$2" --create-only
    ;;
    
  apply)
    echo "🚀 Applying pending migrations..."
    npx prisma migrate deploy
    ;;
    
  dev)
    if [ -z "$2" ]; then
      echo "❌ Error: Migration name required"
      echo "Usage: ./scripts/migrate.sh dev <migration_name>"
      exit 1
    fi
    echo "🔧 Creating and applying migration: $2"
    npx prisma migrate dev --name "$2"
    ;;
    
  reset)
    echo "⚠️  WARNING: This will delete all data!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      echo "🗑️  Resetting database..."
      npx prisma migrate reset --force
    else
      echo "❌ Reset cancelled"
    fi
    ;;
    
  resolve)
    if [ -z "$2" ]; then
      echo "❌ Error: Migration name required"
      echo "Usage: ./scripts/migrate.sh resolve <migration_name>"
      exit 1
    fi
    echo "✅ Marking migration as applied: $2"
    npx prisma migrate resolve --applied "$2"
    ;;
    
  generate)
    echo "🔨 Generating Prisma Client..."
    npx prisma generate
    ;;
    
  push)
    echo "⚡ Pushing schema to database (no migration)..."
    npx prisma db push
    ;;
    
  studio)
    echo "🎨 Opening Prisma Studio..."
    npx prisma studio
    ;;
    
  help|*)
    cat << EOF
📚 Database Migration Helper

Commands:
  status              Check migration status
  create <name>       Create new migration (don't apply)
  apply               Apply pending migrations
  dev <name>          Create and apply migration (development)
  reset               Reset database (WARNING: deletes all data)
  resolve <name>      Mark migration as applied
  generate            Generate Prisma Client
  push                Push schema without migration
  studio              Open Prisma Studio
  help                Show this help

Examples:
  ./scripts/migrate.sh status
  ./scripts/migrate.sh create add_user_fields
  ./scripts/migrate.sh dev add_user_fields
  ./scripts/migrate.sh apply
  ./scripts/migrate.sh studio

Production Workflow:
  1. Create migration: ./scripts/migrate.sh create <name>
  2. Review SQL in prisma/migrations/
  3. Apply: ./scripts/migrate.sh apply

Development Workflow:
  ./scripts/migrate.sh dev <name>
EOF
    ;;
esac

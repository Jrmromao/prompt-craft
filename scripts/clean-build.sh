#!/bin/bash

echo "🧹 Cleaning build artifacts..."

# Remove Next.js build
rm -rf .next

# Remove node_modules (optional)
if [ "$1" = "--full" ]; then
  echo "🗑️  Removing node_modules..."
  rm -rf node_modules
  echo "📦 Reinstalling dependencies..."
  yarn install
fi

echo "✅ Clean complete"

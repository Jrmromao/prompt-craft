#!/bin/bash
set -e

echo "🔧 Fixing TypeScript errors..."

# Backup first
echo "📦 Creating backup..."
git add -A
git stash push -m "Before TS fixes"

# Fix Prisma relation property access (lowercase to capitalized)
echo "🔨 Fixing Prisma relation names..."

find app lib utils -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # Skip test files
  if [[ $file == *"test"* ]] || [[ $file == *"spec"* ]]; then
    continue
  fi
  
  # Fix property access patterns
  sed -i '' -E 's/\.subscription([^A-Za-z])/\.Subscription\1/g' "$file"
  sed -i '' -E 's/\.user([^A-Za-z])/\.User\1/g' "$file"
  sed -i '' -E 's/\.prompt([^A-Za-z])/\.Prompt\1/g' "$file"
  sed -i '' -E 's/\.comments([^A-Za-z])/\.Comment\1/g' "$file"
  sed -i '' -E 's/\.tags([^A-Za-z])/\.Tag\1/g' "$file"
  sed -i '' -E 's/\.votes([^A-Za-z])/\.Vote\1/g' "$file"
  sed -i '' -E 's/\.plan([^A-Za-z])/\.Plan\1/g' "$file"
  sed -i '' -E 's/\.versions([^A-Za-z])/\.PromptVersion\1/g' "$file"
  sed -i '' -E 's/\.apiKeys([^A-Za-z])/\.ApiKey\1/g' "$file"
done

echo "✅ Fixed Prisma relation names"
echo "📊 Checking remaining errors..."

# Count remaining errors
ERROR_COUNT=$(yarn tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "Remaining errors: $ERROR_COUNT"


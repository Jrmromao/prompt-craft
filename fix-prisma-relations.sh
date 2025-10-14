#!/bin/bash

# Fix Prisma relation names from lowercase to capitalized

find app lib utils -name "*.ts" -type f | while read file; do
  # Fix in include blocks
  sed -i '' 's/subscription: true/Subscription: true/g' "$file"
  sed -i '' 's/subscription: {/Subscription: {/g' "$file"
  sed -i '' 's/user: true/User: true/g' "$file"
  sed -i '' 's/user: {/User: {/g' "$file"
  sed -i '' 's/prompts: true/Prompt: true/g' "$file"
  sed -i '' 's/prompts: {/Prompt: {/g' "$file"
  sed -i '' 's/comments: true/Comment: true/g' "$file"
  sed -i '' 's/comments: {/Comment: {/g' "$file"
  sed -i '' 's/tags: true/Tag: true/g' "$file"
  sed -i '' 's/tags: {/Tag: {/g' "$file"
  sed -i '' 's/votes: true/Vote: true/g' "$file"
  sed -i '' 's/votes: {/Vote: {/g' "$file"
  sed -i '' 's/plan: true/Plan: true/g' "$file"
  sed -i '' 's/plan: {/Plan: {/g' "$file"
  sed -i '' 's/prompt: true/Prompt: true/g' "$file"
  sed -i '' 's/prompt: {/Prompt: {/g' "$file"
  sed -i '' 's/versions: true/PromptVersion: true/g' "$file"
  sed -i '' 's/versions: {/PromptVersion: {/g' "$file"
  sed -i '' 's/apiKeys: true/ApiKey: true/g' "$file"
  sed -i '' 's/apiKeys: {/ApiKey: {/g' "$file"
  sed -i '' 's/userAchievements: true/UserAchievement: true/g' "$file"
  sed -i '' 's/userAchievements: {/UserAchievement: {/g' "$file"
  sed -i '' 's/promptVersion: true/PromptVersion: true/g' "$file"
  sed -i '' 's/promptVersion: {/PromptVersion: {/g' "$file"
done

echo "✅ Fixed Prisma relation names"

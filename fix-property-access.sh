#!/bin/bash

find app lib utils components -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/__tests__/*" | while read file; do
  # Fix property access (but not prisma model calls)
  # Match: variable.subscription but not prisma.subscription
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription\./$1.Subscription./g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription\?\./$1.Subscription?./g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription!\./$1.Subscription!./g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription\)/$1.Subscription)/g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription,/$1.Subscription,/g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription;/$1.Subscription;/g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.subscription$/$1.Subscription/g' "$file"
  
  # Same for user
  perl -i -pe 's/(?<!prisma\.)(\w+)\.user\./$1.User./g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.user\?\./$1.User?./g' "$file"
  perl -i -pe 's/(?<!prisma\.)(\w+)\.user!\./$1.User!./g' "$file"
done

echo "✅ Fixed property access"

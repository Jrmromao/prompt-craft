#!/bin/bash

# Fix only include/select blocks, not model names
find app lib utils components -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/__tests__/*" | while read file; do
  # Fix include blocks
  perl -i -pe 's/(include:\s*\{\s*)user(\s*:)/$1User$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)subscription(\s*:)/$1Subscription$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)prompt(\s*:)/$1Prompt$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)comments(\s*:)/$1Comment$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)tags(\s*:)/$1Tag$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)votes(\s*:)/$1Vote$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)plan(\s*:)/$1Plan$2/g' "$file"
  perl -i -pe 's/(include:\s*\{\s*)versions(\s*:)/$1PromptVersion$2/g' "$file"
  
  # Fix select blocks  
  perl -i -pe 's/(select:\s*\{\s*)prompts(\s*:)/$1Prompt$2/g' "$file"
  perl -i -pe 's/(select:\s*\{\s*)comments(\s*:)/$1Comment$2/g' "$file"
done

echo "✅ Fixed include/select blocks"

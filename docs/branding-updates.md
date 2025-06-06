# PromptCraft Branding Updates

This document tracks all the places where we need to update the branding from "PromptCraft" to "PromptCraft" for consistency.

## Completed Updates

1. `app/layout.tsx`

   - Updated metadata title and description
   - ✅ Completed

2. `components/PromptCraftLandingClient.tsx`

   - Renamed component to `PromptCraftLandingClient`
   - Updated all branding references
   - ✅ Completed

3. `app/page.tsx`
   - Updated import statement
   - ✅ Completed

## Pending Updates

### 1. Legal Pages

- `app/legal/terms/page.tsx`

  - Update all instances of "PromptCraft" to "PromptCraft"
  - Update email from egal@PromptCraft.co to legal@PromptCraft.co

- `app/legal/privacy/page.tsx`
  - Update all instances of "PromptCraft" to "PromptCraft"
  - Update email from egal@PromptCraft.co to legal@PromptCraft.co

### 2. Auth Pages

- `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

  - Update branding text

- `app/(auth)/sign-up/[[...sign-up]]/page.tsx`
  - Update branding text

### 3. Navigation Components

- `components/layout/NavBar.tsx`

  - Update logo text

- `components/layout/PublicNavBar.tsx`
  - Update branding text

### 4. Footer Component

- `app/components/Footer.tsx`
  - Update copyright text
  - Update legal email
  - Update logo alt text

### 5. Blog Pages

- `app/blog/page.tsx`
  - Update title and description
  - Update all content references

### 6. Community Prompts Pages

- `app/community-prompts/[slug]/page.tsx`

  - Update metadata
  - Update page title

- `app/community-prompts/page.tsx`
  - Update metadata
  - Update page title

### 7. Configuration Files

- `package.json`

  - Update project name

- `public/manifest.json`
  - Update app name and short name

### 8. Documentation

- `docs/dev-plan/long-term-dev.md`

  - Update project name references

- `docs/launch-priorities.md`
  - Update project name references

## SEO and Metadata Updates

### URLs to Update

- Update all instances of `PromptCraft.com` to `PromptCraft.co`
- Update all canonical URLs
- Update all OpenGraph URLs
- Update all Twitter card URLs

### Meta Tags to Update

- Update all title tags
- Update all description tags
- Update all OpenGraph tags
- Update all Twitter card tags

## Next Steps

1. Create a script to automate the replacement of "PromptCraft" with "PromptCraft" in all files
2. Update all email addresses from @PromptCraft.com to @PromptCraft.co
3. Update all URLs from PromptCraft.com to PromptCraft.co
4. Test all pages after updates to ensure no broken links
5. Update any hardcoded references in the database or environment variables

## Notes

- Keep the existing file structure and component names where possible
- Update only the display text and branding elements
- Maintain all existing functionality
- Test thoroughly after each update
- Update documentation as changes are made

## Priority Order

1. Core branding (layout, navigation, footer)
2. Legal pages (terms, privacy)
3. Auth pages
4. Blog and community pages
5. Configuration files
6. Documentation
7. Database and environment variables

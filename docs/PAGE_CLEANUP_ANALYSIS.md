# Page Cleanup Analysis

## Current State: 37 pages, ~14 actually used

### ✅ KEEP - Core Pages (14 pages)
1. `/` - Homepage
2. `/dashboard` - Main dashboard
3. `/analytics` - Analytics page
4. `/pricing` - Pricing page
5. `/sign-in` - Auth
6. `/sign-up` - Auth
7. `/settings` - Settings hub
8. `/account` - Account page
9. `/docs` - Docs homepage
10. `/docs/quickstart` - Getting started
11. `/docs/sdk` - SDK docs
12. `/docs/api` - API docs
13. `/legal/privacy-policy` - Required
14. `/legal/terms-of-service` - Required

### ❌ DELETE - Unused/Duplicate Pages (14 pages)

#### Duplicate Legal Pages
- `/legal/privacy` (duplicate of privacy-policy)
- `/legal/terms` (duplicate of terms-of-service)
- `/legal/cookie-policy` (not linked, can add to privacy-policy)

#### Unused Account Pages
- `/account/activity` (not linked)
- `/account/privacy` (not linked, covered in /settings/privacy)
- `/account/rectify` (not linked, GDPR feature not in nav)

#### Unused Settings Pages
- `/settings/activity` (not linked)
- `/settings/usage` (not linked, covered in /account)
- `/settings/alerts` (not linked)
- `/settings/profile` (not linked, covered in /account)
- `/settings/billing` (not linked, covered in /account)

#### Unused Docs Pages
- `/docs/advanced` (not linked)
- `/docs/errors` (not linked)

#### Unused Feature Pages
- `/optimizer` (duplicate of /prompts/optimize)
- `/prompts/optimize` (not linked, feature not ready)

#### Utility Pages (keep but not counted)
- `/sso-callback` (OAuth callback)
- `/unauthorized` (error page)
- `/admin/gdpr-compliance` (admin only)

### 🔨 MISSING - Linked but Don't Exist (11 pages)
These are linked in nav but pages don't exist:
- `/about`
- `/blog`
- `/careers`
- `/community-prompts`
- `/contact`
- `/explore`
- `/prompts`
- `/prompts/create`
- `/prompts/my-prompts`
- `/support`
- `/settings/integrations`

## Recommendation

### Phase 1: Delete Unused (14 pages)
Remove pages that exist but are never linked and serve no purpose.

### Phase 2: Fix Navigation
Remove links to non-existent pages OR create placeholder pages.

### Phase 3: Consolidate
- Merge duplicate legal pages
- Consolidate settings into fewer pages
- Remove /optimizer (use /prompts/optimize)

## Expected Result
- **Before**: 37 pages (14 used, 14 unused, 9 utility)
- **After**: ~20 pages (14 core + 6 utility)
- **Reduction**: 46% fewer pages

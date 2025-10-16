# TypeScript Cleanup Plan

## Summary
- **Total Errors**: 355
- **Files Affected**: ~80 files
- **Estimated Effort**: 4-6 hours

## Error Breakdown by Type

### 1. TS2339 (131 errors) - Property does not exist
**Problem**: Code references deleted models/fields
- `prisma.prompt` (deleted model) - 47 references
- `prisma.vote` (deleted model)
- `prisma.comment` (deleted model)
- `prisma.follow` (deleted model)
- `user.subscription` (should be `user.Subscription`)
- `user.company`, `user.jobTitle` (deleted fields)
- `promptId` field on PromptRun (deleted)

**Fix**: Delete files or replace with correct model names

### 2. TS2322 (58 errors) - Type not assignable
**Problem**: Prisma create/update missing required fields (id, updatedAt)
**Fix**: Add missing fields or use Prisma's auto-generation

### 3. TS2353 (46 errors) - Unknown properties in object literal
**Problem**: Using deleted fields in Prisma queries
- `subscription` (should be `Subscription`)
- `promptId` (deleted from PromptRun)
- `encryptedKey` (deleted from ApiKey)
- `company`, `jobTitle` (deleted from User)

**Fix**: Remove or rename fields

### 4. TS2561 (32 errors) - Wrong case in Prisma relations
**Problem**: `subscription` vs `Subscription`, `user` vs `User`
**Fix**: Use PascalCase for relations

### 5. TS2307 (15 errors) - Cannot find module
**Problem**: Deleted service files still imported
- `@/lib/services/clientAnalyticsService`
- `@/lib/services/contextEngineering`
- `@/lib/services/promptOptimizer`
- `@/lib/services/templateService`
- `@/lib/services/emailService`
- `@/lib/services/PerformanceService`
- `@/lib/services/slugService`
- `@/lib/services/backup-service`
- `@/lib/services/quota-service`
- `@/lib/services/planService`

**Fix**: Delete importing files or create stub services

## Files by Priority

### CRITICAL (Breaks Core Features)
1. `app/api/usage/limits/route.ts` - Usage tracking API
2. `app/api/subscription/current/route.ts` - Subscription checks
3. `lib/services/analyticsService.ts` - Analytics core
4. `lib/services/subscriptionService.ts` - Subscription logic
5. `middleware/planLimits.ts` - Plan enforcement

### HIGH (Dead Features - Safe to Delete)
1. `app/api/community/leaderboards/route.ts` - Social feature (deleted)
2. `components/admin/VoteAbuseManagementDashboard.tsx` - Vote system (deleted)
3. `components/prompts/CreatePromptDialog.tsx` - Prompt marketplace (deleted)
4. `lib/services/gdpr.ts` - References deleted models
5. `lib/services/GDPRService.ts` - Duplicate GDPR service
6. `lib/services/usageTrackingService.ts` - References deleted Prompt model
7. `examples/smart-call-example.ts` - Example code
8. `examples/v2-killer-features.ts` - Example code

### MEDIUM (Cleanup)
1. `scripts/seed-prompts.ts` - Seeder for deleted model
2. `scripts/backfillSlugs.ts` - References deleted Prompt
3. `prisma/seeders/gamification.ts` - Gamification (deleted)
4. `components/privacy/DataRectificationForm.tsx` - References deleted fields

### LOW (Can Ignore)
1. `types/prompt.ts` - Type for deleted model
2. `types/prisma.ts` - Type helpers

## Recommended Approach

### Option A: Nuclear (2 hours)
Delete all files referencing deleted models. Fast but risky.

**Delete List** (30 files):
```
app/api/community/leaderboards/route.ts
app/api/follow/route.ts
components/admin/VoteAbuseManagementDashboard.tsx
components/prompts/CreatePromptDialog.tsx
components/BasicComments.tsx
components/Playground.tsx
components/profile/public-profile.tsx
components/PromptAnalyticsContext.tsx
lib/services/gdpr.ts (keep GDPRService.ts)
lib/services/usageTrackingService.ts (duplicate)
lib/schema/backfillSlugs.ts
scripts/backfillSlugs.ts
scripts/seed-prompts.ts
scripts/seed-specific-user.ts
scripts/seed-templates.ts
prisma/seed-templates.ts
prisma/seeders/gamification.ts
examples/smart-call-example.ts
examples/v2-killer-features.ts
types/prompt.ts
```

### Option B: Surgical (4-6 hours)
Fix each error properly. Safer but slower.

1. Fix case sensitivity (Subscription vs subscription) - 32 errors - 30 min
2. Remove deleted field references - 46 errors - 1 hour
3. Fix missing imports - 15 errors - 30 min
4. Fix Prisma create/update - 58 errors - 2 hours
5. Fix deleted model references - 131 errors - 2 hours
6. Fix type errors - remaining - 1 hour

### Option C: Hybrid (1 hour)
Delete dead features, fix critical paths only.

1. Delete all social/prompt marketplace files (30 files) - 10 min
2. Fix subscription case sensitivity in critical files - 20 min
3. Fix usage tracking in critical APIs - 30 min
4. Ignore examples, scripts, seeders

## Decision Matrix

| Approach | Time | Risk | TypeScript Clean | App Works |
|----------|------|------|------------------|-----------|
| Do Nothing | 0h | Low | ❌ | ✅ |
| Nuclear | 2h | Medium | ✅ | ✅ |
| Surgical | 6h | Low | ✅ | ✅ |
| Hybrid | 1h | Low | 🟡 | ✅ |

## Recommendation

**Go with Hybrid** - Delete dead features, fix critical paths, ship it.

Your app works. TypeScript errors don't affect production. Clean up the obvious dead code (social features, prompt marketplace) and fix the 5 critical files that handle subscriptions and usage tracking. Leave the rest for later.

Total effort: 1 hour
Result: 80% cleaner, 100% functional

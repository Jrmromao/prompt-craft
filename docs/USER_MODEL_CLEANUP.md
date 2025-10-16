# User Model Cleanup Analysis

## Unused Fields (4 fields to remove)

### ❌ profileUrl
- **Usage**: 0 references in code
- **Purpose**: Custom profile URL (e.g., /u/username)
- **Status**: Feature never implemented
- **Action**: DELETE

### ❌ isPublic
- **Usage**: 0 references in code  
- **Purpose**: Public/private profile toggle
- **Status**: Feature never implemented
- **Action**: DELETE

### ❌ dataDeletionRequest
- **Usage**: 0 references in code
- **Purpose**: GDPR deletion request timestamp
- **Status**: Duplicate - we have `deletedAt` and `DataRetentionSchedule` table
- **Action**: DELETE

### ❌ lastDataAccess
- **Usage**: 0 references in code
- **Purpose**: Track last data access for GDPR
- **Status**: Not implemented, not needed
- **Action**: DELETE

## Keep (Actually Used)

✅ **Core Identity** (8 fields)
- id, email, clerkId, name, username, role, planType, status

✅ **Profile** (3 fields)
- imageUrl, bio, displayName

✅ **Credits & Billing** (6 fields)
- monthlyCredits, purchasedCredits, creditCap, lastCreditReset, stripeCustomerId, stripeSubscriptionId

✅ **Settings JSON** (4 fields)
- emailPreferences, notificationSettings, themeSettings, securitySettings

✅ **GDPR** (3 fields)
- smartRoutingEnabled, deletedAt, dataRetentionPolicy, dataProcessingConsent

✅ **Timestamps** (3 fields)
- createdAt, updatedAt, lastActiveAt

## Impact

**Before**: 27 scalar fields  
**After**: 23 scalar fields (-4)  
**Reduction**: 15% cleaner

## Migration

```sql
ALTER TABLE "User" DROP COLUMN IF EXISTS "profileUrl";
ALTER TABLE "User" DROP COLUMN IF EXISTS "isPublic";
ALTER TABLE "User" DROP COLUMN IF EXISTS "dataDeletionRequest";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastDataAccess";
```

## Risk: LOW
- No code references these fields
- No data loss (fields are empty/unused)
- Clean migration

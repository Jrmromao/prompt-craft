# TypeScript Critical Fixes - Action Plan

**Current State:** 426 TypeScript errors (hidden by `ignoreBuildErrors: true`)  
**Target:** 0 errors  
**Timeline:** 3-5 days

---

## ✅ STEP 1: Enable TypeScript Checking (DONE)

```javascript
// next.config.js - Changed:
typescript: {
  ignoreBuildErrors: false,  // ✅ Now enforced
}
```

---

## 🔧 STEP 2: Fix Prisma Relation Names (93 errors)

### Problem
Prisma relations must be capitalized in `include` and property access.

### Pattern
```typescript
// ❌ Wrong:
include: { subscription: true }
user.subscription.status

// ✅ Correct:
include: { Subscription: true }
user.Subscription.status
```

### Files to Fix (Top Priority)
```bash
# Subscription (26 occurrences):
app/api/billing/checkout/route.ts
app/api/billing/history/route.ts
app/api/billing/methods/route.ts
app/api/stripe/create-checkout/route.ts
lib/services/billingService.ts

# User (16 occurrences):
app/api/admin/abuse/detections/route.ts
app/api/admin/stats/route.ts
utils/api-keys.ts

# Comments (14 occurrences):
Multiple files with comment relations

# Prompts (8 occurrences):
app/api/admin/users/[id]/route.ts
Multiple prompt-related files
```

### Fix Command
```bash
# Run this carefully - test each file:
find app/api/billing -name "*.ts" -exec sed -i '' \
  's/include: { subscription:/include: { Subscription:/g; \
   s/\.subscription\b/.Subscription/g' {} \;
```

---

## 🔧 STEP 3: Add Missing Required Fields (108 errors - TS2322)

### Problem
Prisma `create()` calls missing required fields like `id`, `userId`, etc.

### Pattern
```typescript
// ❌ Wrong:
await prisma.auditLog.create({
  data: {
    action: 'UPDATE',
    resource: 'user',
    status: 'success'
    // Missing: id, userId, timestamp
  }
})

// ✅ Correct:
await prisma.auditLog.create({
  data: {
    id: generateId(),
    userId: user.id,
    action: 'UPDATE',
    resource: 'user',
    status: 'success',
    timestamp: new Date()
  }
})
```

### Files to Fix
```
app/admin/moderation/services/moderationActions.ts (lines 44, 92)
app/admin/moderation/services/moderationService.ts (lines 189, 225)
app/api/admin/email-templates/route.ts (line 78)
app/api/admin/roles/update/route.ts (line 43)
utils/api-keys.ts (line 44)
scripts/seed-prompts.ts (multiple lines)
scripts/seed-templates.ts (line 422)
```

---

## 🔧 STEP 4: Fix Case Sensitivity (1 error - TS1261)

### Problem
```typescript
// File imported with different casing:
import { UserService } from '@/lib/services/UserService'
// But file is: lib/services/userService.ts
```

### Fix
```bash
# Rename file to match import:
mv lib/services/userService.ts lib/services/UserService.ts
```

---

## 🔧 STEP 5: Fix Missing Type Annotations (12 errors - TS7006)

### Problem
Parameters without types in strict mode.

### Pattern
```typescript
// ❌ Wrong:
function handleError(error) {
  console.error(error)
}

// ✅ Correct:
function handleError(error: Error | unknown) {
  console.error(error)
}
```

---

## 📊 Error Breakdown

| Error Type | Count | Description | Priority |
|------------|-------|-------------|----------|
| TS2322 | 108 | Type mismatch (missing fields) | HIGH |
| TS2551 | 92 | Wrong property name | HIGH |
| TS2353 | 44 | Unknown property in include | HIGH |
| TS2339 | 44 | Property doesn't exist | HIGH |
| TS2561 | 25 | Wrong relation name | HIGH |
| TS2739 | 18 | Missing required properties | MEDIUM |
| TS7006 | 12 | Missing type annotation | MEDIUM |
| TS2352 | 9 | Conversion error | LOW |
| TS2686 | 7 | Type used before assignment | LOW |
| TS2304 | 7 | Cannot find name | LOW |

---

## 🎯 Recommended Approach

### Day 1: Prisma Relations (93 errors → ~330 remaining)
1. Fix all `subscription` → `Subscription` (26 files)
2. Fix all `user` → `User` (16 files)
3. Fix all `comments` → `Comment` (14 files)
4. Fix all `prompts` → `Prompt` (8 files)
5. Test build after each batch

### Day 2: Missing Fields (330 → ~220 remaining)
1. Fix AuditLog creates (add id, userId, timestamp)
2. Fix Moderation creates (add required fields)
3. Fix EmailTemplate creates (add id)
4. Fix RoleChangeLog creates (add id)
5. Fix ApiKey creates (add id)

### Day 3: Seed Scripts & Utils (220 → ~200 remaining)
1. Fix scripts/seed-prompts.ts (Tag creates)
2. Fix scripts/seed-templates.ts (PromptTemplate creates)
3. Fix utils/api-keys.ts (include and property access)

### Day 4: Type Annotations & Cleanup (200 → ~0 remaining)
1. Add missing type annotations
2. Fix case sensitivity issues
3. Fix remaining edge cases
4. Run full build test

### Day 5: Validation & Testing
1. Run `yarn build` - must pass
2. Run `yarn tsc --noEmit` - must show 0 errors
3. Run tests - fix any broken by changes
4. Manual QA of affected features

---

## 🚨 CRITICAL: Test After Each Fix

```bash
# After each batch of fixes:
yarn tsc --noEmit 2>&1 | grep "error TS" | wc -l

# Should see number decreasing:
426 → 380 → 330 → 220 → 100 → 0
```

---

## 🛠 Helper Scripts

### Count Errors by Type
```bash
yarn tsc --noEmit 2>&1 | grep "error TS" | \
  grep -o "error TS[0-9]*" | sort | uniq -c | sort -rn
```

### Find Specific Error
```bash
yarn tsc --noEmit 2>&1 | grep "TS2322" | head -10
```

### Check Specific File
```bash
yarn tsc --noEmit app/api/billing/checkout/route.ts
```

---

## ⚠️ WARNINGS

1. **Don't use global find/replace** - Too risky, breaks working code
2. **Fix one file at a time** - Easier to debug
3. **Test after each fix** - Catch issues early
4. **Commit frequently** - Easy to revert if needed
5. **Check runtime behavior** - Type fixes can change logic

---

## 📝 Progress Tracking

- [ ] Day 1: Prisma relations (426 → 330)
- [ ] Day 2: Missing fields (330 → 220)
- [ ] Day 3: Seed scripts (220 → 200)
- [ ] Day 4: Type annotations (200 → 0)
- [ ] Day 5: Validation & testing

**Current:** 426 errors  
**Target:** 0 errors  
**Status:** Plan created, ready to execute

---

## 🎓 Key Learnings

1. **Never disable TypeScript checking** - Hides real problems
2. **Prisma relations are case-sensitive** - Must match schema
3. **Required fields must be provided** - No shortcuts
4. **Type safety prevents runtime errors** - Worth the effort

---

**Next Step:** Start with Day 1 - Fix Prisma relations systematically, one file at a time.

# Plan of Action: Implementing Pricing Tiers & PAYG Logic in PromptHive

## Overview
This document outlines the steps to correctly and robustly implement the new pricing tiers (Free, Pro, Elite, Enterprise) and Pay-as-you-go (PAYG) credits in PromptHive. It is tailored to the current codebase structure, which uses Clerk for authentication, Prisma for the database, and yarn as the package manager. All business logic should be handled in service files (no direct Prisma calls in React components). The authentication flow is complete, and audit logging and GDPR compliance are in place.

---

## 1. **Update Plan Definitions & Constants**
- **Location:** `@/app/constants/` or a new `plans.ts` file
- Define all plan tiers, their features, limits, credit pricing, and post-MVP features in a single source of truth.
- Example:
  ```ts
  export const PLANS = {
    FREE: { ... },
    PRO: { ... },
    ELITE: { ... },
    ENTERPRISE: { ... }
  };
  ```
- Include:
  - Prompt/test run limits
  - Credit pricing/minimums
  - Model access (DeepSeek, GPT-3.5, Premium)
  - BYOK eligibility
  - Post-MVP features (with a flag)

---

## 2. **Backend: Enforce Plan Logic in Services**
- **Location:** `@/app/lib/services/`
- All business logic (limits, feature access, credit purchase, model selection) should be in service files.
- **No direct Prisma calls in components.**
- Implement:
  - Plan/feature checks (e.g., can user access a feature? Is a feature post-MVP?)
  - Credit purchase logic (enforce minimums, correct price, block for Elite/Enterprise)
  - Model selection logic (choose model based on plan)
  - BYOK logic (unlimited test runs if BYOK)
  - Audit logging for plan/credit changes

---

## 3. **Database: Prisma Migrations**
- **Location:** `@/app/db/` (Prisma schema)
- Update user/subscription models to store:
  - Current plan
  - Credit balance
  - BYOK status
  - Audit logs for plan/credit changes
- Run `npx prisma migrate` to apply changes.

---

## 4. **UI: Update Pricing & Feature Display**
- **Location:** `@/components/PromptHiveLandingClient.tsx` and related pricing components
- Use the plan constants for all feature/limit display.
- Mark post-MVP features with underline and tooltip.
- Show correct credit pricing, minimums, and model access per plan.
- Hide PAYG purchase for Elite/Enterprise; show "Unlimited credits included."
- Ensure all price displays use two decimals and correct annual/monthly logic.

---

## 5. **Credit Purchase & Stripe Integration**
- **Location:** `@/app/api/` and `@/app/lib/services/`
- Update/create API endpoints for credit purchase.
- Enforce plan-based minimums and pricing in the backend.
- Integrate with Stripe for payment processing.
- Block credit purchase for Elite/Enterprise in backend.

---

## 6. **Testing & QA**
- **Location:** `@/tests/` (if present) or create new test files
- Unit and integration tests for:
  - Plan enforcement (limits, feature access)
  - Credit purchase logic
  - Model selection
  - UI display for all plans
- Manual QA: Test all flows as Free, Pro, Elite, and Enterprise users.

---

## 7. **Audit Logging & GDPR**
- Ensure all plan/credit changes are logged (for audit/GDPR compliance).
- Location: Service layer and/or middleware.

---

## 8. **Documentation & Rollout**
- Update user-facing docs and onboarding to explain new plans and features.
- Announce changes to users.

---

## 9. **Ongoing Maintenance**
- Keep plan constants and service logic in sync.
- Regularly review for compliance, performance, and user feedback.

---

## Additional Features
PromptHive already has a wide range of features implemented beyond the scope of this pricing and PAYG plan. This document focuses specifically on the subscription and credit system, but the platform includes many more capabilities for prompt management, analytics, community, admin, support, and more.

---

## Notes
- **Clerk** handles authentication and user management.
- **Prisma** is used for all DB access (no direct DB calls in components).
- **yarn** is the package manager for all dependencies and scripts.
- **Audit logging** and **GDPR** are already in place—ensure new logic is covered.

---

**This plan should be followed step by step to ensure a robust, maintainable, and compliant implementation of your new pricing and PAYG system.** 
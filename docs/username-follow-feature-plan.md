# Plan: Add Twitter-Style Usernames & Follow Feature

## 1. Overview
This document outlines the steps to add unique, Twitter-style usernames and a user follow system to enhance community and privacy features.

---

## 2. Database Schema Changes

### User Model
- Add a `username` field to the `User` model in `prisma/schema.prisma`:
  ```prisma
  model User {
    id        String   @id @default(cuid())
    email     String   @unique
    username  String   @unique
    // ...other fields...
  }
  ```
- Enforce uniqueness and non-null (after migration).

### Follow Model
- Add a new `Follow` model:
  ```prisma
  model Follow {
    id          String   @id @default(cuid())
    followerId  String
    followingId String
    createdAt   DateTime @default(now())
    follower    User     @relation("Follower", fields: [followerId], references: [id])
    following   User     @relation("Following", fields: [followingId], references: [id])

    @@unique([followerId, followingId])
    @@index([followerId])
    @@index([followingId])
  }
  ```

---

## 3. Backend/API Changes
- **User registration/profile update:**
  - Validate username (regex: `^[a-z][a-z0-9_]{3,14}$`)
  - Check uniqueness
- **Follow endpoints:**
  - POST `/api/follow` (follow/unfollow user)
  - GET `/api/user/:username/followers` and `/following`
- **Expose follower/following counts in user profile API.**

---

## 4. Frontend Changes
- **Username input:**
  - On signup/profile, require username (show as `@username`)
  - Validate with regex and show errors
- **Display usernames:**
  - Use `@username` everywhere public (profiles, comments, mentions)
- **Follow button:**
  - On user profiles and next to usernames
  - Show follower/following counts
- **Followers/Following lists:**
  - Modal or page to show lists
- **Optional:** Personalized feed from followed users

---

## 5. Migration for Existing Users
- Auto-generate usernames for users without one (e.g., `user1234`)
- Prompt users to pick a username on next login

---

## 6. Privacy & UX Notes
- Usernames are public; never show email in public UI
- Allow users to change username (with limits, e.g., once/month)
- Rate-limit follow actions to prevent spam

---

## 7. Next Steps
1. Update Prisma schema and run migration
2. Implement backend validation and endpoints
3. Update frontend forms and profile pages
4. Test end-to-end (signup, follow, privacy)
5. Announce feature to users

---

*Last updated: 2024-06-09* 
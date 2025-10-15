# Clerk Sign-Up Configuration Guide

## Current Issue
Sign-up form may be asking for unnecessary fields (like Date of Birth).

## Goal
Minimal sign-up: Email + Password only (or OAuth)

---

## Step 1: Go to Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to **User & Authentication** → **Email, Phone, Username**

---

## Step 2: Configure Required Fields

### **Email Settings:**
- ✅ Email address: **Required**
- ✅ Verify at sign-up: **Yes** (recommended)

### **Username Settings:**
- ❌ Username: **Optional** or **Off**

### **Phone Settings:**
- ❌ Phone number: **Off**

### **Name Settings:**
- Go to **User & Authentication** → **Personal Information**
- ❌ First name: **Optional** (collect later in onboarding)
- ❌ Last name: **Optional**
- ❌ Date of birth: **Off** ← TURN THIS OFF

---

## Step 3: Configure OAuth Providers

Go to **User & Authentication** → **Social Connections**

Enable:
- ✅ Google (most common)
- ✅ GitHub (for developers)
- ❌ Others (optional)

---

## Step 4: Customize Sign-Up Appearance

Go to **Customization** → **Theme**

### **Branding:**
- Logo: Upload your logo
- Brand color: #6366f1 (purple/blue)
- Background: White or light gray

### **Sign-Up Form:**
- Show "Continue with Google" first
- Show "Continue with GitHub" second
- Show email/password last

---

## Step 5: Configure Sign-Up Flow

Go to **User & Authentication** → **Restrictions**

### **Sign-up modes:**
- ✅ Public (anyone can sign up)
- ❌ Invitation only
- ❌ Restricted domains

### **Email verification:**
- ✅ Require email verification
- Send verification email immediately

---

## Step 6: Test Sign-Up Flow

1. Go to your app: `http://localhost:3000/sign-up`
2. Should see:
   ```
   Sign up for PromptCraft
   
   [Continue with Google]
   [Continue with GitHub]
   
   ─── or ───
   
   Email: ___________
   Password: ___________
   
   [Sign Up]
   
   Already have an account? Sign in
   ```

3. Should NOT see:
   - ❌ Date of birth
   - ❌ Phone number
   - ❌ Address
   - ❌ Any other fields

---

## Step 7: Configure Post-Sign-Up Redirect

In your code, Clerk redirects to `/dashboard` after sign-up.

This is already configured in `middleware.ts`:
```typescript
if (userId && (isSignInPage || isSignUpPage)) {
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
```

---

## Step 8: Add Onboarding (Optional)

After sign-up, redirect to onboarding to collect optional info:

Create `/app/onboarding/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [useCase, setUseCase] = useState('');

  const handleSubmit = async () => {
    // Update user metadata
    await user?.update({
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
    });

    // Save use case to your database
    await fetch('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify({ useCase }),
    });

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Welcome to PromptCraft!</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              What's your name? (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              What will you use PromptCraft for?
            </label>
            <select
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select...</option>
              <option value="personal">Personal project</option>
              <option value="startup">Startup</option>
              <option value="company">Company</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Summary

### **Minimal Sign-Up (Required):**
- ✅ Email
- ✅ Password (or OAuth)

### **Turn OFF:**
- ❌ Date of birth
- ❌ Phone number
- ❌ Address
- ❌ Any other fields

### **Collect Later (Optional):**
- Name (in onboarding)
- Use case (in onboarding)
- Company (in settings)

### **Result:**
- Faster sign-ups
- Less friction
- Higher conversion
- GDPR compliant

---

## Quick Checklist

- [ ] Go to Clerk Dashboard
- [ ] Turn OFF date of birth field
- [ ] Turn OFF phone number field
- [ ] Make name fields optional
- [ ] Enable Google OAuth
- [ ] Enable GitHub OAuth
- [ ] Test sign-up flow
- [ ] Verify only email + password required
- [ ] (Optional) Add onboarding page

**Done! Sign-up is now minimal and friction-free.**

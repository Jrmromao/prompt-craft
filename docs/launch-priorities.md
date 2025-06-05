# PromptHive MVP Launch Priorities

A prioritized checklist of features and tasks to complete before launching the first version of PromptHive.

---

## 1. Critical for Launch
- [x] **Access Control**: Only allow editing/deleting prompts by their owner. Hide edit/delete buttons for others.
- [x] **Prompt Creation UX**: Validation, error handling, and user feedback (toasts) for prompt creation, editing, and deletion.
- [x] **Slug Uniqueness**: Ensure slug generation is robust and handles collisions.
- [x] **Admin Features**: Admin dashboard for prompt approval/rejection. Protect admin-only routes.
- [ ] **User Profile Page**: Allow users to view and edit their profile (name, email, avatar).
- [ ] **Empty & Loading States**: Friendly empty states and loading skeletons for all lists and detail pages.
- [ ] **Error Handling**: Add error boundaries and user-friendly error messages.
- [ ] **Input Validation & Security**: Sanitize and validate all user input (prevent XSS, SQLi).

## 2. Highly Recommended
- [ ] **Analytics**: Integrate Google Analytics and error logging (e.g., Sentry).
- [ ] **Legal Pages**: Add privacy policy, terms of service, and support/contact page.
- [ ] **Rate Limiting**: Protect APIs (especially upvotes) from abuse.
- [ ] **Testing**: Add unit and integration tests for core business logic and UI.

## 3. Optional for MVP, Essential for SaaS
- [ ] **Payments**: Integrate Stripe or another payment provider for paid plans.
- [ ] **Plan Management UI**: Allow users to view/upgrade/downgrade plans.
- [ ] **Email/Notifications**: Email verification, password reset, and notifications for approvals, etc.

## 4. Deployment
- [ ] **Production Deployment**: Deploy to Vercel, AWS, or another production host.
- [ ] **Environment Variables**: Ensure all secrets and API keys are set for production.

## Partially Implemented / Needs Review Checklist

### 1. User Profile Page
- [ ] User can view their profile information (name, email, avatar)
- [ ] User can edit their profile information
- [ ] User can upload/change avatar
- [ ] Profile form has validation and error feedback
- [ ] Profile page has loading and error states
- [ ] Profile updates are persisted and reflected immediately

### 2. Empty & Loading States
- [ ] All lists (prompts, dashboard, community, etc.) show a friendly empty state when no data
- [ ] All lists and detail pages show a loading skeleton or spinner while fetching data
- [ ] Empty/loading states are accessible and visually consistent

### 3. Error Handling
- [ ] Global error boundary is implemented (catches unhandled errors and shows user-friendly message)
- [ ] All forms and actions show clear error messages on failure
- [ ] API/network errors are handled gracefully in the UI
- [ ] Error states are accessible and visually consistent

### 4. Input Validation & Security
- [ ] All user input is validated on the client (length, format, required fields)
- [ ] All user input is validated on the server (API endpoints)
- [ ] Inputs are sanitized to prevent XSS
- [ ] Database queries are protected against SQL injection
- [ ] Sensitive actions require authentication/authorization
- [ ] Validation errors are shown clearly to the user

---

**Tip:** Tackle the "Critical for Launch" section first for a strong, secure MVP. Move to "Highly Recommended" and "Optional" as time allows. 
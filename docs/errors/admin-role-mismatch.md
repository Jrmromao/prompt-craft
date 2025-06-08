# Admin Role Mismatch Error

## Error Description

When accessing admin-protected routes or features, users might encounter an "Unauthorized to access" error even when they should have admin privileges. This typically occurs due to a mismatch between the Clerk user ID and the database user role.

## Common Causes

1. User was created through Clerk but not properly assigned the 'ADMIN' role in the database
2. Database query using incorrect ID field (using `id` instead of `clerkId`)
3. Role not being properly synchronized between Clerk and the database

## Error Message

```
Error: Unauthorized to access analytics
    at AnalyticsService.getAnalytics (./lib/services/analyticsService.ts:35:19)
```

## Solution

1. Ensure the user is properly created in the database with the correct role:

```typescript
await prisma.user.update({
  where: { clerkId: userId },
  data: { role: 'ADMIN' },
});
```

2. Use the correct ID field when querying the database:

```typescript
const user = await prisma.user.findUnique({
  where: { clerkId: userId }, // Use clerkId instead of id
  select: { role: true },
});
```

3. Implement proper role checking in admin-protected routes:

```typescript
if (!user || user.role !== 'ADMIN') {
  throw new Error('Unauthorized to access admin features');
}
```

## Development Mode

In development mode (`NODE_ENV === 'development'`), admin access is automatically granted to all users. This is implemented in the admin check endpoint:

```typescript
// Allow access in development mode
if (process.env.NODE_ENV === 'development') {
  return new NextResponse('Authorized (Development Mode)', { status: 200 });
}
```

This makes it easier to develop and test admin features without needing to set up admin users in the development database.

## Prevention

1. Implement proper user role management in the admin dashboard
2. Add role checks in the Clerk webhook handler when creating new users
3. Use consistent ID fields (clerkId) when querying user data
4. Add logging for role-related operations to track potential issues

## Related Files

- `app/api/auth/check-admin/route.ts`
- `lib/services/analyticsService.ts`
- `app/api/webhooks/clerk/route.ts`

## Additional Notes

- Always use `clerkId` when querying users in the database
- Consider implementing a role management interface for administrators
- Add proper error handling and user feedback for unauthorized access attempts
- Development mode bypasses admin checks for easier testing and development

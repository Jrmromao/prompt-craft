# Next.js 15.3.3 Route Handler Type Issues

## Problem Description

When upgrading to Next.js 15.3.3, you may encounter type errors in your API route handlers, particularly in dynamic routes. The error message typically looks like this:

```
Type error: Route "app/api/[path]/route.ts" has an invalid "GET" export:
  Type "CustomContext" is not a valid type for the function's second argument.
```

## Root Cause

The issue stems from how Next.js 15.3.3 handles type definitions for route handlers:

1. **Custom Type Definitions**: Using custom types or interfaces for the context parameter
2. **Dynamic Route Wrappers**: Using custom wrappers like `withDynamicRoute`
3. **Optional Parameters**: Making the context parameter optional
4. **Union Types**: Using union types for the context parameter

## Affected Files

The following patterns in your codebase need to be updated:

1. Files using custom context types:
   ```typescript
   type RouteContext = {
     params: {
       id: string;
     };
   };
   ```

2. Files using dynamic route wrappers:
   ```typescript
   export const GET = withDynamicRoute(handler, fallbackData);
   ```

3. Files with optional context parameters:
   ```typescript
   export async function GET(request: Request, context?: RouteContext)
   ```

## Solution

### 1. Basic Route Handler Pattern

For non-dynamic routes:
```typescript
export async function GET(request: Request) {
  // Handler logic
}
```

### 2. Dynamic Route Handler Pattern

For dynamic routes (e.g., `[id]`, `[metric]`):
```typescript
export async function GET(
  request: Request,
  context: any  // Let Next.js infer the types
) {
  const { id } = context.params;
  // Handler logic
}
```

### 3. Route Configuration

Add these exports at the top of your route files:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

### 4. Remove Custom Wrappers

Remove any custom route wrappers and their imports:
```typescript
// Remove these
import { dynamicRouteConfig, withDynamicRoute } from '@/lib/utils/dynamicRoute';
export const { dynamic, revalidate, runtime } = dynamicRouteConfig;
```

## Implementation Steps

1. **Identify Affected Files**
   - Search for files using custom context types
   - Search for files using dynamic route wrappers
   - Search for files with optional context parameters

2. **Update Each File**
   - Remove custom type definitions
   - Remove dynamic route wrappers
   - Update handler signatures
   - Add route configuration exports

3. **Testing**
   - Run `yarn build` to check for type errors
   - Test each route to ensure functionality
   - Verify dynamic parameters are still accessible

## Example Before/After

### Before:
```typescript
type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = context.params;
  // Handler logic
}
```

### After:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request, context: any) {
  const { id } = context.params;
  // Handler logic
}
```

## Notes

- This is a breaking change in Next.js 15.3.3
- The solution prioritizes type inference over explicit typing
- All route handlers in the codebase need to be updated
- The changes are backward compatible with existing functionality

## References

- [Next.js 15.3.3 Release Notes](https://nextjs.org/docs)
- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) 
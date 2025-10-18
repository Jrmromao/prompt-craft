# Amazon Q Context - Setup Complete

**Date:** October 15, 2025  
**Status:** ✅ Comprehensive Q context configured

---

## What Was Created

### 1. Project Rules (`.amazonq/rules/`)

#### `codebase-rules.md` (Comprehensive)
- **Prisma naming conventions** (CRITICAL)
- Architecture patterns (Singleton services)
- API response format
- Error handling standards
- TypeScript rules
- Database migration workflow
- Component patterns
- Security rules
- Performance optimization
- Common mistakes to avoid

#### `styling-rules.md`
- Brand colors and gradients
- Glass-morphism patterns
- Component styling
- Dark mode requirements
- Typography standards

### 2. Updated Q-context.md

Added to main context:
- Current project status
- Tech stack details
- Critical Prisma naming rules
- Build size targets
- Business model
- Project goals

### 3. Build Optimization

**next.config.js updates:**
- Added package import optimization for 10+ libraries
- Externalized Prisma for server components
- Reduced bundle size

**New scripts:**
- `scripts/clean-build.sh` - Clean build artifacts

---

## Critical Rules for Amazon Q

### Prisma Naming (MOST IMPORTANT)

```typescript
// ✅ CORRECT
prisma.user.findUnique()           // Models: lowercase
include: { User: true }             // Relations: Capitalized
user.Subscription.status            // Property access: Capitalized

// ❌ WRONG
prisma.User.findUnique()           // Don't capitalize models
include: { user: true }             // Don't lowercase relations
user.subscription.status            // Don't lowercase property access
```

### API Response Format

```typescript
// Always return this structure
return NextResponse.json({
  success: true,
  data: result,
  error: null
}, { status: 200 });
```

### Service Pattern

```typescript
// Singleton pattern
class UserService {
  private static instance: UserService;
  static getInstance() { ... }
}
export default UserService.getInstance();
```

---

## Build Size Targets

### Current Status
```
First Load JS: 218 KB ✅ (target: < 220 KB)
.next/static: 6.6 MB ✅ (target: < 60 MB)
.next/server: 26 MB ✅ (target: < 50 MB)
.next/cache: 839 MB ⚠️ (clean regularly)
```

### How to Maintain

```bash
# Clean cache regularly
rm -rf .next/cache

# Or use script
./scripts/clean-build.sh

# Check size
du -sh .next
```

---

## Using Q Context

### When Starting Work

1. Q automatically loads `~/Q-context.md`
2. Q checks `.amazonq/rules/` in project directory
3. Q follows project-specific standards

### For New Features

Q will now:
- Use correct Prisma naming
- Follow API response format
- Apply brand styling
- Include dark mode
- Use singleton pattern for services
- Add proper error handling

### For Bug Fixes

Q will:
- Check existing patterns first
- Follow established conventions
- Maintain code consistency
- Not introduce new patterns

---

## Quick Reference

### File Locations

```
~/Q-context.md                              # Main Q context
/path/to/project/.amazonq/rules/            # Project rules
  ├── codebase-rules.md                     # Architecture & patterns
  └── styling-rules.md                      # UI & brand standards
```

### Key Commands

```bash
# Development
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn tsc --noEmit          # Type check

# Database
./scripts/migrate.sh status           # Check migrations
./scripts/migrate.sh dev <name>       # Create migration

# Cleanup
./scripts/clean-build.sh              # Clean build
rm -rf .next/cache                    # Clean cache only
```

---

## What This Solves

### Before
- ❌ Inconsistent Prisma naming (426 TS errors)
- ❌ No clear coding standards
- ❌ Build size growing uncontrolled
- ❌ Q didn't know project patterns

### After
- ✅ Clear Prisma naming rules documented
- ✅ Comprehensive coding standards
- ✅ Build size optimized and monitored
- ✅ Q follows project conventions automatically

---

## Next Steps

### Immediate
1. Q will now follow these rules automatically
2. New code will use correct patterns
3. Build size stays under control

### Ongoing
1. Update rules as patterns evolve
2. Add new standards when needed
3. Keep Q context in sync with project

### Future
1. Add testing standards
2. Add deployment standards
3. Add API documentation standards

---

## Testing Q Context

Ask Q to:
1. "Create a new API route for user profile"
   - Should use correct response format
   - Should include auth check
   - Should use proper error handling

2. "Create a service to manage prompts"
   - Should use Singleton pattern
   - Should use correct Prisma naming
   - Should include proper types

3. "Create a UI component for prompt card"
   - Should use brand colors
   - Should include dark mode
   - Should use glass-morphism

---

## Maintenance

### Weekly
- Check build size: `du -sh .next`
- Clean cache if > 1GB: `rm -rf .next/cache`

### Monthly
- Review and update rules
- Add new patterns discovered
- Remove outdated conventions

### Quarterly
- Full Q context review
- Update project status
- Align with business goals

---

## Benefits

1. **Consistency** - All code follows same patterns
2. **Speed** - Q generates correct code first time
3. **Quality** - Standards enforced automatically
4. **Onboarding** - New developers have clear guide
5. **Maintenance** - Easier to understand codebase

---

## Resources

- **Main Context:** `~/Q-context.md`
- **Project Rules:** `.amazonq/rules/`
- **Migration Guide:** `MIGRATIONS.md`
- **Build Guide:** `next.config.js`

---

**Setup By:** Amazon Q  
**Date:** October 15, 2025  
**Status:** ✅ Ready to use  
**Next Review:** After 100 users or major changes

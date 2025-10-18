# Development Guidelines

## End-of-Day Rule

Before marking any day's work as complete, you MUST:

1. **Run tests**: `yarn test`
2. **Build the app**: `yarn build`
3. **Verify both pass** - fix any failures before proceeding
4. **Commit changes**: `git commit` with detailed message (DO NOT push)

This ensures we catch issues early and maintain production readiness throughout development.

## Commands

- `yarn dev` - Start development server
- `yarn test` - Run test suite
- `yarn build` - Production build
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `npx prisma studio` - Open database GUI

## Project Status

**Current Phase**: Production Ready ✅
**Days Completed**: 14/14
**Test Coverage**: 530+ passing tests
**Build Status**: Successful

## Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (optional but recommended)
- **Auth**: Clerk
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## Key Features Implemented

1. ✅ Cost tracking across AI providers
2. ✅ Analytics dashboard with insights
3. ✅ Optimization suggestions
4. ✅ Team collaboration
5. ✅ Alerts & notifications
6. ✅ Export & reporting
7. ✅ Subscription management
8. ✅ Rate limiting & security
9. ✅ Caching for performance
10. ✅ Health checks

## Next Steps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for launch checklist.

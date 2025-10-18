# Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- [ ] `CLERK_SECRET_KEY` - Clerk secret key
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `STRIPE_STARTER_PRICE_ID` - Starter plan price ID
- [ ] `STRIPE_PRO_PRICE_ID` - Pro plan price ID
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` - Enterprise plan price ID
- [ ] `REDIS_URL` - Redis connection string (optional)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL

### Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify schema: `npx prisma db pull`
- [ ] Seed initial data (if needed)

### Stripe Setup
- [ ] Create products and prices in Stripe dashboard
- [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Security
- [ ] Enable HTTPS
- [ ] Configure CORS if needed
- [ ] Set up rate limiting
- [ ] Review API key permissions
- [ ] Enable Clerk production mode

## Deployment Steps

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add CLERK_SECRET_KEY
   # ... add all variables
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

1. **Build Image**
   ```bash
   docker build -t promptcraft .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="..." \
     -e CLERK_SECRET_KEY="..." \
     promptcraft
   ```

## Post-Deployment

### Verification
- [ ] Visit `/api/health` - Should return `{"status":"healthy"}`
- [ ] Test authentication flow
- [ ] Create test subscription
- [ ] Verify webhook delivery
- [ ] Test SDK integration
- [ ] Check analytics dashboard

### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Create alerts for critical errors

### Performance
- [ ] Enable CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up Redis for caching
- [ ] Enable compression

## Rollback Plan

If issues occur:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

3. **Notify Users**
   - Post status update
   - Send email if needed

## Launch Checklist

- [ ] All tests passing
- [ ] Build successful
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Stripe configured
- [ ] Health check passing
- [ ] Documentation updated
- [ ] Team notified
- [ ] Monitoring active
- [ ] Backup plan ready

## Support

- **Email**: support@promptcraft.app
- **Status Page**: status.promptcraft.app
- **Documentation**: docs.promptcraft.app

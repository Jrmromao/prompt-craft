# Database Migrations Guide

## Current Status ✅

- **Total Migrations:** 107
- **Database:** PostgreSQL (localhost:5433)
- **Schema:** In sync with Prisma schema
- **Last Migration:** `20251015072640_add_version_column`

---

## Quick Commands

```bash
# Check status
./scripts/migrate.sh status

# Create new migration (dev)
./scripts/migrate.sh dev add_new_field

# Apply migrations (production)
./scripts/migrate.sh apply

# Open Prisma Studio
./scripts/migrate.sh studio
```

---

## Migration Workflow

### Development

1. **Modify Prisma Schema**
   ```prisma
   // prisma/schema.prisma
   model User {
     id    String @id @default(cuid())
     email String @unique
     // Add new field
     phone String?
   }
   ```

2. **Create Migration**
   ```bash
   ./scripts/migrate.sh dev add_phone_field
   ```

3. **Review Generated SQL**
   - Check `prisma/migrations/[timestamp]_add_phone_field/migration.sql`
   - Verify changes are correct

4. **Test**
   - Run app and test new field
   - Check database with Prisma Studio

### Production

1. **Create Migration (Don't Apply)**
   ```bash
   ./scripts/migrate.sh create add_phone_field
   ```

2. **Review SQL Carefully**
   - Check for data loss
   - Verify indexes
   - Check constraints

3. **Commit Migration**
   ```bash
   git add prisma/migrations/
   git commit -m "Add phone field migration"
   ```

4. **Deploy**
   ```bash
   # On production server
   ./scripts/migrate.sh apply
   ```

---

## Common Scenarios

### Adding a Column

```prisma
model User {
  newField String? // Optional field (safe)
}
```

```bash
./scripts/migrate.sh dev add_new_field
```

### Adding Required Column (Existing Data)

```prisma
model User {
  newField String @default("default_value") // Provide default
}
```

### Renaming Column

⚠️ **Requires manual migration!**

```sql
-- migration.sql
ALTER TABLE "User" RENAME COLUMN "oldName" TO "newName";
```

### Deleting Column

⚠️ **Data loss!**

```prisma
model User {
  // Remove field from schema
}
```

### Adding Index

```prisma
model User {
  email String @unique
  
  @@index([email])
}
```

---

## Migration Best Practices

### ✅ DO

- **Always review generated SQL** before applying
- **Test migrations locally** first
- **Backup production database** before major migrations
- **Use optional fields** when adding columns to existing tables
- **Provide defaults** for required fields
- **Create small, focused migrations**
- **Name migrations descriptively**
- **Commit migrations to git**

### ❌ DON'T

- **Don't edit existing migrations** (create new ones)
- **Don't use `prisma db push`** in production
- **Don't skip migration review**
- **Don't delete migrations** from git
- **Don't rename tables** without data migration plan
- **Don't add required fields** without defaults to tables with data

---

## Troubleshooting

### Migration Drift Detected

**Problem:** Database doesn't match migration history

**Solution:**
```bash
# Option 1: Mark current state as migrated
./scripts/migrate.sh resolve <migration_name>

# Option 2: Reset (DEV ONLY - deletes data)
./scripts/migrate.sh reset
```

### Failed Migration

**Problem:** Migration failed halfway

**Solution:**
```bash
# 1. Check what failed
./scripts/migrate.sh status

# 2. Fix the issue manually in database
# 3. Mark as resolved
./scripts/migrate.sh resolve <migration_name>

# Or rollback and fix migration SQL
```

### Duplicate Key Error

**Problem:** Adding unique constraint with duplicate data

**Solution:**
```sql
-- Clean duplicates first
DELETE FROM "Table" a USING "Table" b
WHERE a.id < b.id AND a.email = b.email;

-- Then apply migration
```

### Schema Out of Sync

**Problem:** Prisma schema doesn't match database

**Solution:**
```bash
# Pull current database schema
npx prisma db pull

# Review changes
git diff prisma/schema.prisma

# Create migration for differences
./scripts/migrate.sh dev sync_schema
```

---

## Migration History

### Recent Migrations

- `20251015072640_add_version_column` - Added version tracking to Version table
- `20251012090340_add_version_limits` - Added version limits
- `20250904153045_add_competitive_features` - Competitive features
- `20250904152045_add_social_features` - Social features

### Migration Statistics

- Total: 107 migrations
- First: `20241125214551_imit_db`
- Latest: `20251015072640_add_version_column`

---

## Emergency Procedures

### Rollback Migration (Production)

⚠️ **Use with extreme caution!**

```bash
# 1. Backup database
pg_dump -h localhost -U postgres devPrompthive > backup.sql

# 2. Manually revert changes
psql -h localhost -U postgres devPrompthive < rollback.sql

# 3. Update migration table
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '<migration_to_rollback>';
```

### Database Corruption

```bash
# 1. Stop application
# 2. Restore from backup
psql -h localhost -U postgres devPrompthive < backup.sql

# 3. Verify schema
./scripts/migrate.sh status

# 4. Restart application
```

---

## Monitoring

### Check Migration Status

```bash
# Quick check
./scripts/migrate.sh status

# Detailed check
npx prisma migrate status --verbose
```

### Verify Schema Integrity

```bash
# Compare schema with database
npx prisma validate

# Generate client (will fail if schema invalid)
npx prisma generate
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Migrations
  run: |
    npx prisma migrate deploy
    npx prisma generate
```

### Pre-deployment Checklist

- [ ] All migrations committed to git
- [ ] Migrations tested locally
- [ ] Database backup created
- [ ] Migration SQL reviewed
- [ ] Rollback plan prepared
- [ ] Team notified of schema changes

---

## Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Migration Script](./scripts/migrate.sh)
- [Prisma Schema](./prisma/schema.prisma)
- [Migrations Directory](./prisma/migrations/)

---

**Last Updated:** October 15, 2025  
**Maintained By:** Development Team

# Database Migration Plan

## Overview
This document outlines the database migration plan for implementing enterprise features in PromptCraft. The migration will be executed in phases to ensure minimal disruption and maintain data integrity.

## Current Schema Analysis
The current database schema includes basic prompt management and user features. We need to extend it to support:
- Team management
- Version control
- Advanced analytics
- Enterprise security features

## Migration Phases

### Phase 1: Team Management (Week 1)

```sql
-- Create Team Management Tables
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "settings" JSONB DEFAULT '{"maxMembers": 5, "allowedFeatures": []}',
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TeamMember_teamId_userId_key" UNIQUE ("teamId", "userId")
);

-- Add indexes
CREATE INDEX "Team_ownerId_idx" ON "Team"("ownerId");
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- Add foreign keys
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" 
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
```

### Phase 2: Version Control (Week 2)

```sql
-- Create Version Control Tables
CREATE TABLE "PromptVersion" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "changes" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PromptApproval" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PromptApproval_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "PromptVersion_promptId_idx" ON "PromptVersion"("promptId");
CREATE INDEX "PromptVersion_createdBy_idx" ON "PromptVersion"("createdBy");
CREATE INDEX "PromptApproval_promptId_idx" ON "PromptApproval"("promptId");
CREATE INDEX "PromptApproval_versionId_idx" ON "PromptApproval"("versionId");
CREATE INDEX "PromptApproval_approverId_idx" ON "PromptApproval"("approverId");

-- Add foreign keys
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_promptId_fkey" 
    FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE;
ALTER TABLE "PromptVersion" ADD CONSTRAINT "PromptVersion_createdBy_fkey" 
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "PromptApproval" ADD CONSTRAINT "PromptApproval_promptId_fkey" 
    FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE;
ALTER TABLE "PromptApproval" ADD CONSTRAINT "PromptApproval_versionId_fkey" 
    FOREIGN KEY ("versionId") REFERENCES "PromptVersion"("id") ON DELETE CASCADE;
ALTER TABLE "PromptApproval" ADD CONSTRAINT "PromptApproval_approverId_fkey" 
    FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE CASCADE;
```

### Phase 3: Analytics & Usage Tracking (Week 3)

```sql
-- Create Analytics Tables
CREATE TABLE "UsageAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "feature" TEXT NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    CONSTRAINT "UsageAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PerformanceMetrics" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "responseTime" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceMetrics_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "UsageAnalytics_userId_idx" ON "UsageAnalytics"("userId");
CREATE INDEX "UsageAnalytics_teamId_idx" ON "UsageAnalytics"("teamId");
CREATE INDEX "UsageAnalytics_feature_idx" ON "UsageAnalytics"("feature");
CREATE INDEX "PerformanceMetrics_promptId_idx" ON "PerformanceMetrics"("promptId");
CREATE INDEX "PerformanceMetrics_createdAt_idx" ON "PerformanceMetrics"("createdAt");

-- Add foreign keys
ALTER TABLE "UsageAnalytics" ADD CONSTRAINT "UsageAnalytics_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "UsageAnalytics" ADD CONSTRAINT "UsageAnalytics_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;

ALTER TABLE "PerformanceMetrics" ADD CONSTRAINT "PerformanceMetrics_promptId_fkey" 
    FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE;
```

### Phase 4: Enterprise Security (Week 4)

```sql
-- Create Security Tables
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "scopes" TEXT[] NOT NULL,
    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");
CREATE INDEX "ApiKey_hashedKey_idx" ON "ApiKey"("hashedKey");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_teamId_idx" ON "AuditLog"("teamId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Add foreign keys
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_teamId_fkey" 
    FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;
```

## Data Migration Strategy

### 1. Preparation
- Create database backups
- Set up monitoring
- Prepare rollback scripts
- Test migrations in staging

### 2. Execution
- Execute migrations in phases
- Run data validation
- Update application code
- Deploy new features

### 3. Verification
- Verify data integrity
- Test new features
- Monitor performance
- Check security

## Rollback Plan

### For Each Phase
1. Stop application services
2. Restore database backup
3. Revert schema changes
4. Restart services

## Monitoring & Maintenance

### Performance Monitoring
- Query performance
- Index usage
- Table sizes
- Connection counts

### Maintenance Tasks
- Regular backups
- Index maintenance
- Statistics updates
- Vacuum operations

## Security Considerations

### Data Protection
- Encrypt sensitive data
- Implement row-level security
- Set up access controls
- Monitor access patterns

### Compliance
- Audit logging
- Data retention
- Access tracking
- Security policies

## Next Steps

1. **Preparation**
   - Review and approve migration plan
   - Schedule maintenance window
   - Prepare team
   - Set up monitoring

2. **Execution**
   - Execute Phase 1
   - Verify and test
   - Proceed to next phase
   - Monitor performance

3. **Post-Migration**
   - Verify all features
   - Update documentation
   - Train team
   - Monitor system 
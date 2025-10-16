# Privacy by Design & Default (GDPR Article 25)

## Core Principles

### 1. Proactive not Reactive
- Privacy measures built into system design from the start
- Risk assessments conducted before new features
- Privacy impact considered in all technical decisions

### 2. Privacy as Default Setting
- Minimal data collection by default
- Strictest privacy settings enabled automatically
- Users must opt-in to data sharing, not opt-out

### 3. Privacy Embedded into Design
- Not bolted on as an add-on
- Integral part of system architecture
- No trade-off between privacy and functionality

## Technical Measures Implemented

### Data Minimization
```typescript
// Only collect what's needed
interface UserProfile {
  id: string;           // Required
  email: string;        // Required for auth
  name?: string;        // Optional
  // NO: birthdate, phone, address unless explicitly needed
}

// Prompt data - no PII stored
interface PromptRun {
  id: string;
  userId: string;       // Pseudonymized
  model: string;
  tokensUsed: number;
  cost: number;
  // Input/output NOT stored by default
  // User must opt-in to logging
}
```

### Pseudonymization
```typescript
// User IDs are UUIDs, not sequential
id: string @id @default(cuid())

// IP addresses hashed for analytics
const hashedIP = crypto
  .createHash('sha256')
  .update(ipAddress + process.env.IP_SALT)
  .digest('hex');

// Email addresses encrypted at rest
const encryptedEmail = encrypt(email, process.env.ENCRYPTION_KEY);
```

### Encryption

**At Rest**:
- Database: PostgreSQL with encryption enabled
- Backups: AES-256 encrypted
- API keys: Bcrypt hashed (cost factor 12)
- Sensitive fields: Field-level encryption

**In Transit**:
- HTTPS/TLS 1.3 only
- HSTS headers enforced
- Certificate pinning for API calls

```typescript
// Encryption utility
import { createCipheriv, createDecipheriv } from 'crypto';

export function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}
```

### Access Controls
```typescript
// Role-based access control
enum Role {
  USER,       // Own data only
  ADMIN,      // Support access with audit log
  SUPER_ADMIN // Full access with MFA required
}

// Middleware enforces least privilege
export function requireRole(role: Role) {
  return (req, res, next) => {
    if (req.user.role < role) {
      auditLog.log('UNAUTHORIZED_ACCESS_ATTEMPT', req.user.id);
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
```

### Audit Logging
```typescript
// All data access logged
model AuditLog {
  id        String   @id
  userId    String?
  action    String   // READ, UPDATE, DELETE, EXPORT
  resource  String   // User, Prompt, ApiKey
  details   Json
  ipAddress String?
  timestamp DateTime @default(now())
}

// Automatic logging
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (['update', 'delete', 'deleteMany'].includes(params.action)) {
    await prisma.auditLog.create({
      data: {
        action: params.action.toUpperCase(),
        resource: params.model,
        details: params.args,
        timestamp: new Date()
      }
    });
  }
  
  return result;
});
```

### Data Retention Automation
```typescript
// Automatic deletion based on retention policy
export async function enforceRetention() {
  const now = new Date();
  
  // Usage logs: 90 days
  await prisma.promptRun.deleteMany({
    where: {
      createdAt: { lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
    }
  });
  
  // Audit logs: 1 year
  await prisma.auditLog.deleteMany({
    where: {
      timestamp: { lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
    }
  });
  
  // Soft-deleted users: 30 days
  await prisma.user.deleteMany({
    where: {
      deletedAt: { 
        lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        not: null
      }
    }
  });
}

// Run daily via cron
// 0 2 * * * node scripts/enforce-retention.js
```

### Anonymization for Analytics
```typescript
// Aggregate analytics without PII
interface DashboardMetrics {
  totalUsers: number;           // Count only
  avgTokensPerUser: number;     // Aggregated
  topModels: { model: string; count: number }[];
  // NO: individual user data, emails, names
}

// Query uses aggregation
const metrics = await prisma.promptRun.groupBy({
  by: ['model'],
  _count: { id: true },
  _avg: { tokensUsed: true }
  // No user-level data exposed
});
```

## Privacy by Default Settings

### New User Defaults
```typescript
const defaultSettings = {
  // Privacy-first defaults
  emailPreferences: {
    productUpdates: false,      // Opt-in required
    marketingEmails: false,     // Opt-in required
    securityAlerts: true        // Critical only
  },
  
  dataProcessingConsent: {
    analytics: false,           // Opt-in required
    marketing: false,           // Opt-in required
    thirdParty: false          // Opt-in required
  },
  
  notificationSettings: {
    pushNotifications: false,   // Opt-in required
    emailNotifications: true,   // Essential only
    browserNotifications: false // Opt-in required
  },
  
  // Profile private by default
  isPublic: false,
  
  // Minimal data retention
  dataRetentionPolicy: {
    autoDelete: true,
    retentionPeriod: 90,        // Minimum required
    dataCategories: ['usage']   // Only essential
  }
};
```

### Feature Privacy Controls
```typescript
// Prompt logging opt-in
interface PromptRunOptions {
  logInput: boolean;    // Default: false
  logOutput: boolean;   // Default: false
  shareAnalytics: boolean; // Default: false
}

// User must explicitly enable
const run = await sdk.smartCall({
  prompt: "...",
  model: "gpt-4",
  privacy: {
    logInput: true,     // User opted in
    logOutput: false    // Still private
  }
});
```

## Data Protection Impact Assessment (DPIA)

Required for high-risk processing. Template:

### 1. Description of Processing
- What data is collected?
- Why is it collected?
- How is it processed?
- Who has access?
- How long is it retained?

### 2. Necessity and Proportionality
- Is this data necessary for the purpose?
- Could we achieve the goal with less data?
- Are there less intrusive alternatives?

### 3. Risk Assessment
- What could go wrong?
- What's the impact on users?
- How likely is each risk?

### 4. Mitigation Measures
- Technical safeguards implemented
- Organizational measures in place
- Residual risk after mitigation

### 5. DPO Consultation
- DPO review and sign-off
- Recommendations implemented
- Ongoing monitoring plan

## Privacy-Enhancing Technologies (PETs)

### Differential Privacy
```typescript
// Add noise to aggregate statistics
function addNoise(value: number, epsilon: number = 0.1): number {
  const noise = (Math.random() - 0.5) * (2 / epsilon);
  return Math.round(value + noise);
}

// Public stats are noised
const publicStats = {
  totalUsers: addNoise(actualUserCount),
  avgCost: addNoise(actualAvgCost)
};
```

### Homomorphic Encryption (Future)
- Process encrypted data without decrypting
- For sensitive AI model training
- Implementation: [Planned for v2.0]

### Secure Multi-Party Computation (Future)
- Collaborative analytics without sharing raw data
- For cross-organization benchmarking
- Implementation: [Planned for v2.0]

## Vendor Privacy Requirements

All third-party vendors must:
- ✅ Sign Data Processing Agreement (DPA)
- ✅ Provide SOC 2 Type II certification
- ✅ Support data deletion requests
- ✅ Encrypt data at rest and in transit
- ✅ Notify breaches within 24 hours
- ✅ Allow audits of their systems

**Current Vendors**:
- Vercel (hosting): DPA signed ✅
- Upstash (Redis): DPA signed ✅
- Clerk (auth): DPA signed ✅
- Stripe (payments): DPA signed ✅
- OpenAI (AI): DPA signed ✅

## Privacy Review Checklist

Before launching new features:

- [ ] DPIA completed if high-risk
- [ ] Data minimization applied
- [ ] Privacy-by-default settings configured
- [ ] Encryption implemented where needed
- [ ] Access controls defined
- [ ] Audit logging enabled
- [ ] Retention policy set
- [ ] DPO consulted
- [ ] Privacy policy updated
- [ ] User consent flows tested

## Continuous Monitoring

### Automated Checks
```bash
# Daily privacy scan
npm run privacy:scan

# Checks:
# - Unencrypted PII fields
# - Missing audit logs
# - Excessive data retention
# - Weak access controls
# - Outdated vendor DPAs
```

### Quarterly Reviews
- Review all data processing activities
- Update ROPA (Records of Processing Activities)
- Audit vendor compliance
- Test data deletion procedures
- Review and update this documentation

## Documentation Updates

This document must be reviewed and updated:
- When new features are added
- When data processing changes
- After security incidents
- Quarterly as part of compliance review
- When GDPR guidance is updated

**Last Updated**: [Date]  
**Next Review**: [Date + 3 months]  
**Reviewed By**: [DPO Name]

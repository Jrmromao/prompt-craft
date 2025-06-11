# GDPR Technical Implementation Guide

## Database Schema Updates

### 1. User Model Extensions
```typescript
// prisma/schema.prisma

model User {
  // Existing fields...
  
  // GDPR Compliance Fields
  dataRetentionPeriod DateTime?
  lastDataAccess      DateTime?
  dataDeletionRequest DateTime?
  consentHistory      ConsentRecord[]
  dataProcessingRecords DataProcessingRecord[]
  dataExportRequests  DataExportRequest[]
  dataRectificationRequests DataRectificationRequest[]
}

model ConsentRecord {
  id          String   @id @default(cuid())
  userId      String
  purpose     String
  granted     Boolean
  timestamp   DateTime @default(now())
  ipAddress   String?
  userAgent   String?
  user        User     @relation(fields: [userId], references: [id])
}

model DataProcessingRecord {
  id          String   @id @default(cuid())
  userId      String
  purpose     String
  legalBasis  String
  startDate   DateTime
  endDate     DateTime?
  status      String
  user        User     @relation(fields: [userId], references: [id])
}

model DataExportRequest {
  id          String   @id @default(cuid())
  userId      String
  status      String
  requestedAt DateTime @default(now())
  completedAt DateTime?
  format      String
  user        User     @relation(fields: [userId], references: [id])
}

model DataRectificationRequest {
  id          String   @id @default(cuid())
  userId      String
  status      String
  requestedAt DateTime @default(now())
  completedAt DateTime?
  changes     Json
  user        User     @relation(fields: [userId], references: [id])
}
```

## Service Layer Implementation

### 1. Data Subject Rights Service
```typescript
// lib/services/dataSubjectRights.ts

import { prisma } from '@/lib/prisma';
import { User, DataExportRequest, DataRectificationRequest } from '@prisma/client';

export class DataSubjectRightsService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        consentHistory: true,
        dataProcessingRecords: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create export request record
    await prisma.dataExportRequest.create({
      data: {
        userId,
        status: 'PENDING',
        format: 'JSON',
      },
    });

    // Process and return user data
    return this.formatUserData(user);
  }

  async handleDeletionRequest(userId: string): Promise<void> {
    // Create deletion request record
    await prisma.user.update({
      where: { id: userId },
      data: {
        dataDeletionRequest: new Date(),
      },
    });

    // Implement deletion logic
    await this.anonymizeUserData(userId);
  }

  async handleRectificationRequest(
    userId: string,
    data: Partial<User>
  ): Promise<void> {
    // Create rectification request record
    await prisma.dataRectificationRequest.create({
      data: {
        userId,
        status: 'PENDING',
        changes: data,
      },
    });

    // Implement rectification logic
    await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    // Implement data anonymization
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        name: 'Deleted User',
        // Anonymize other fields
      },
    });
  }

  private formatUserData(user: User): UserDataExport {
    // Format user data for export
    return {
      personalData: {
        id: user.id,
        email: user.email,
        name: user.name,
        // Other personal data
      },
      consentHistory: user.consentHistory,
      dataProcessingRecords: user.dataProcessingRecords,
      // Other relevant data
    };
  }
}
```

### 2. Data Retention Service
```typescript
// lib/services/dataRetention.ts

import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export class DataRetentionService {
  async checkAndEnforceRetention(): Promise<void> {
    const expiredUsers = await prisma.user.findMany({
      where: {
        dataRetentionPeriod: {
          lt: new Date(),
        },
      },
    });

    for (const user of expiredUsers) {
      await this.handleExpiredData(user);
    }
  }

  async setRetentionPeriod(
    userId: string,
    retentionPeriod: Date
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dataRetentionPeriod: retentionPeriod,
      },
    });
  }

  private async handleExpiredData(user: User): Promise<void> {
    // Implement data expiration logic
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: 'INACTIVE',
        // Additional expiration handling
      },
    });
  }
}
```

### 3. Consent Management Service
```typescript
// lib/services/consentManagement.ts

import { prisma } from '@/lib/prisma';
import { ConsentRecord } from '@prisma/client';

export class ConsentManagementService {
  async recordConsent(
    userId: string,
    purpose: string,
    granted: boolean,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<ConsentRecord> {
    return prisma.consentRecord.create({
      data: {
        userId,
        purpose,
        granted,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      },
    });
  }

  async getConsentHistory(userId: string): Promise<ConsentRecord[]> {
    return prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async hasValidConsent(
    userId: string,
    purpose: string
  ): Promise<boolean> {
    const latestConsent = await prisma.consentRecord.findFirst({
      where: {
        userId,
        purpose,
      },
      orderBy: { timestamp: 'desc' },
    });

    return latestConsent?.granted ?? false;
  }
}
```

## API Endpoints

### 1. Data Subject Rights Endpoints
```typescript
// app/api/gdpr/export/route.ts
import { DataSubjectRightsService } from '@/lib/services/dataSubjectRights';

export async function POST(req: Request) {
  const { userId } = await req.json();
  const service = new DataSubjectRightsService();
  
  try {
    const data = await service.exportUserData(userId);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Export failed' }, { status: 500 });
  }
}

// app/api/gdpr/delete/route.ts
export async function POST(req: Request) {
  const { userId } = await req.json();
  const service = new DataSubjectRightsService();
  
  try {
    await service.handleDeletionRequest(userId);
    return Response.json({ status: 'success' });
  } catch (error) {
    return Response.json({ error: 'Deletion failed' }, { status: 500 });
  }
}
```

## Middleware Implementation

### 1. GDPR Compliance Middleware
```typescript
// middleware/gdpr.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ConsentManagementService } from '@/lib/services/consentManagement';

export async function middleware(request: NextRequest) {
  const consentService = new ConsentManagementService();
  
  // Check for required consents
  const requiredConsents = ['essential', 'analytics'];
  const userId = request.cookies.get('userId')?.value;
  
  if (userId) {
    for (const consent of requiredConsents) {
      const hasConsent = await consentService.hasValidConsent(userId, consent);
      if (!hasConsent) {
        // Redirect to consent page or show consent banner
        return NextResponse.redirect(new URL('/consent', request.url));
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## Testing

### 1. GDPR Compliance Tests
```typescript
// __tests__/gdpr/dataSubjectRights.test.ts
import { DataSubjectRightsService } from '@/lib/services/dataSubjectRights';
import { prisma } from '@/lib/prisma';

describe('DataSubjectRightsService', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.dataExportRequest.deleteMany();
  });

  it('should export user data correctly', async () => {
    const service = new DataSubjectRightsService();
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const exportData = await service.exportUserData(user.id);
    expect(exportData).toHaveProperty('personalData');
    expect(exportData.personalData.email).toBe(user.email);
  });

  it('should handle deletion requests correctly', async () => {
    const service = new DataSubjectRightsService();
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    await service.handleDeletionRequest(user.id);
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updatedUser?.dataDeletionRequest).toBeTruthy();
  });
});
```

## Monitoring and Logging

### 1. GDPR Event Logger
```typescript
// lib/services/gdprLogger.ts
import { prisma } from '@/lib/prisma';

export class GDPRLogger {
  async logEvent(
    eventType: string,
    userId: string,
    details: Record<string, any>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        eventType,
        userId,
        details,
        timestamp: new Date(),
      },
    });
  }

  async getAuditLogs(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
```

## Security Measures

### 1. Data Encryption
```typescript
// lib/services/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }

  encrypt(data: string): { encrypted: string; iv: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
    };
  }

  decrypt(encrypted: string, iv: string): string {
    const decipher = createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, 'hex')
    );
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## Implementation Checklist

- [ ] Database Schema Updates
  - [ ] Add GDPR-related fields to User model
  - [ ] Create new models for consent and processing records
  - [ ] Implement data retention fields

- [ ] Service Layer Implementation
  - [ ] Implement DataSubjectRightsService
  - [ ] Implement DataRetentionService
  - [ ] Implement ConsentManagementService

- [ ] API Endpoints
  - [ ] Create data export endpoint
  - [ ] Create data deletion endpoint
  - [ ] Create data rectification endpoint

- [ ] Middleware
  - [ ] Implement GDPR compliance middleware
  - [ ] Add consent checking
  - [ ] Implement data access logging

- [ ] Testing
  - [ ] Write unit tests for GDPR services
  - [ ] Implement integration tests
  - [ ] Create compliance test suite

- [ ] Monitoring
  - [ ] Set up GDPR event logging
  - [ ] Implement audit trail
  - [ ] Create monitoring dashboard

- [ ] Security
  - [ ] Implement data encryption
  - [ ] Set up access controls
  - [ ] Configure security monitoring

## Next Steps

1. Review and approve technical implementation
2. Set up development environment
3. Begin implementation of database schema updates
4. Implement core services
5. Create API endpoints
6. Set up testing environment
7. Implement monitoring and logging
8. Deploy security measures

---

*Last Updated: [Current Date]*
*Next Review: [Next Review Date]* 
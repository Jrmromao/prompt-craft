# Technical Implementation Guide

## Admin UI Components

### 1. Data Management Dashboard
```typescript
// app/admin/data-management/page.tsx
import { DataInventoryTable } from '@/components/admin/DataInventoryTable';
import { ConsentManagementTable } from '@/components/admin/ConsentManagementTable';
import { DataProcessingTable } from '@/components/admin/DataProcessingTable';
import { ComplianceStatus } from '@/components/admin/ComplianceStatus';

export default function DataManagementDashboard() {
  return (
    <div className="space-y-6">
      <h1>Data Management Dashboard</h1>
      <ComplianceStatus />
      <DataInventoryTable />
      <ConsentManagementTable />
      <DataProcessingTable />
    </div>
  );
}
```

### 2. User Data Management
```typescript
// app/admin/users/[userId]/data/page.tsx
import { UserDataOverview } from '@/components/admin/UserDataOverview';
import { ConsentHistory } from '@/components/admin/ConsentHistory';
import { DataProcessingHistory } from '@/components/admin/DataProcessingHistory';
import { DataExportImport } from '@/components/admin/DataExportImport';

export default function UserDataManagement({ params }: { params: { userId: string } }) {
  return (
    <div className="space-y-6">
      <h1>User Data Management</h1>
      <UserDataOverview userId={params.userId} />
      <ConsentHistory userId={params.userId} />
      <DataProcessingHistory userId={params.userId} />
      <DataExportImport userId={params.userId} />
    </div>
  );
}
```

### 3. Compliance Monitoring
```typescript
// app/admin/compliance/page.tsx
import { ComplianceDashboard } from '@/components/admin/ComplianceDashboard';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { SecurityIncidents } from '@/components/admin/SecurityIncidents';
import { DataRetentionReports } from '@/components/admin/DataRetentionReports';

export default function ComplianceMonitoring() {
  return (
    <div className="space-y-6">
      <h1>Compliance Monitoring</h1>
      <ComplianceDashboard />
      <AuditLogs />
      <SecurityIncidents />
      <DataRetentionReports />
    </div>
  );
}
```

## User Profile Components

### 1. Privacy Settings
```typescript
// app/settings/privacy/page.tsx
import { ConsentManagement } from '@/components/settings/ConsentManagement';
import { DataPreferences } from '@/components/settings/DataPreferences';
import { CommunicationPreferences } from '@/components/settings/CommunicationPreferences';
import { DataExport } from '@/components/settings/DataExport';
import { AccountDeletion } from '@/components/settings/AccountDeletion';

export default function PrivacySettings() {
  return (
    <div className="space-y-6">
      <h1>Privacy Settings</h1>
      <ConsentManagement />
      <DataPreferences />
      <CommunicationPreferences />
      <DataExport />
      <AccountDeletion />
    </div>
  );
}
```

### 2. Data Access
```typescript
// app/settings/data/page.tsx
import { PersonalDataOverview } from '@/components/settings/PersonalDataOverview';
import { DataProcessingHistory } from '@/components/settings/DataProcessingHistory';
import { DataExportRequests } from '@/components/settings/DataExportRequests';
import { DataRectificationRequests } from '@/components/settings/DataRectificationRequests';
import { DataPortability } from '@/components/settings/DataPortability';

export default function DataAccess() {
  return (
    <div className="space-y-6">
      <h1>Data Access</h1>
      <PersonalDataOverview />
      <DataProcessingHistory />
      <DataExportRequests />
      <DataRectificationRequests />
      <DataPortability />
    </div>
  );
}
```

## API Routes

### 1. Data Subject Rights
```typescript
// app/api/user/data/route.ts
import { NextResponse } from 'next/server';
import { DataService } from '@/lib/services/dataService';

export async function GET(req: Request) {
  const dataService = new DataService();
  const data = await dataService.getUserData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const dataService = new DataService();
  const { type, data } = await req.json();
  const result = await dataService.processDataRequest(type, data);
  return NextResponse.json(result);
}
```

### 2. Consent Management
```typescript
// app/api/user/consent/route.ts
import { NextResponse } from 'next/server';
import { ConsentService } from '@/lib/services/consentService';

export async function GET(req: Request) {
  const consentService = new ConsentService();
  const consent = await consentService.getUserConsent();
  return NextResponse.json(consent);
}

export async function POST(req: Request) {
  const consentService = new ConsentService();
  const { purpose, granted } = await req.json();
  const result = await consentService.updateConsent(purpose, granted);
  return NextResponse.json(result);
}
```

## Services

### 1. Data Service
```typescript
// lib/services/dataService.ts
export class DataService {
  async getUserData() {
    // Implementation
  }

  async processDataRequest(type: string, data: any) {
    // Implementation
  }

  async exportUserData() {
    // Implementation
  }

  async deleteUserData() {
    // Implementation
  }
}
```

### 2. Consent Service
```typescript
// lib/services/consentService.ts
export class ConsentService {
  async getUserConsent() {
    // Implementation
  }

  async updateConsent(purpose: string, granted: boolean) {
    // Implementation
  }

  async withdrawConsent(purpose: string) {
    // Implementation
  }
}
```

## Database Migrations

### 1. Add New Models
```prisma
// prisma/migrations/YYYYMMDDHHMMSS_add_gdpr_models.prisma
model DataInventory {
  id String @id
  dataType String
  sensitivityLevel String
  retentionPeriod Int
  legalBasis String
  processingPurpose String
  dataLocation String
  isPersonalData Boolean
  isSensitiveData Boolean
}

model ConsentRecord {
  id String @id
  userId String
  purpose String
  granted Boolean
  timestamp DateTime
  version String
  ipAddress String?
  userAgent String?
  consentType String
  withdrawalDate DateTime?
}

model DataProcessingRecord {
  id String @id
  userId String
  purpose String
  legalBasis String
  startDate DateTime
  endDate DateTime?
  status String
  processor String
  recipient String?
  thirdCountryTransfers Boolean
  safeguards String?
}
```

## Testing

### 1. Unit Tests
```typescript
// __tests__/services/dataService.test.ts
import { DataService } from '@/lib/services/dataService';

describe('DataService', () => {
  it('should get user data', async () => {
    const dataService = new DataService();
    const data = await dataService.getUserData();
    expect(data).toBeDefined();
  });

  it('should process data request', async () => {
    const dataService = new DataService();
    const result = await dataService.processDataRequest('export', {});
    expect(result).toBeDefined();
  });
});
```

### 2. Integration Tests
```typescript
// __tests__/api/user/data.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/user/data/route';

describe('Data API', () => {
  it('should get user data', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req);
    expect(res._getStatusCode()).toBe(200);
  });

  it('should process data request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        type: 'export',
        data: {},
      },
    });

    await POST(req);
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Security Measures

### 1. Access Control
```typescript
// lib/middleware/accessControl.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function accessControl(req: NextRequest) {
  // Implementation
}
```

### 2. Data Encryption
```typescript
// lib/utils/encryption.ts
export function encryptData(data: any) {
  // Implementation
}

export function decryptData(encryptedData: string) {
  // Implementation
}
```

## Monitoring

### 1. Audit Logging
```typescript
// lib/services/auditService.ts
export class AuditService {
  async logAction(action: string, details: any) {
    // Implementation
  }

  async getAuditLogs() {
    // Implementation
  }
}
```

### 2. Compliance Monitoring
```typescript
// lib/services/complianceService.ts
export class ComplianceService {
  async checkCompliance() {
    // Implementation
  }

  async generateReport() {
    // Implementation
  }
}
``` 
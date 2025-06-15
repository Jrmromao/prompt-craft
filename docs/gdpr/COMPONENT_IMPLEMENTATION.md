# Component Implementation Guide

## Admin Components

### 1. DataInventoryTable
```typescript
// components/admin/DataInventoryTable.tsx
import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useDataInventory } from '@/hooks/useDataInventory';

export function DataInventoryTable() {
  const { data, isLoading, error } = useDataInventory();
  const [selectedItem, setSelectedItem] = useState(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2>Data Inventory</h2>
      <Table
        data={data}
        columns={[
          { header: 'Data Type', accessor: 'dataType' },
          { header: 'Sensitivity', accessor: 'sensitivityLevel' },
          { header: 'Retention', accessor: 'retentionPeriod' },
          { header: 'Location', accessor: 'dataLocation' },
          { header: 'Actions', accessor: 'actions' },
        ]}
        onRowClick={setSelectedItem}
      />
      {selectedItem && (
        <div className="mt-4">
          <h3>Details</h3>
          {/* Show detailed information */}
        </div>
      )}
    </div>
  );
}
```

### 2. ConsentManagementTable
```typescript
// components/admin/ConsentManagementTable.tsx
import { useState } from 'react';
import { Table } from '@/components/ui/Table';
import { useConsent } from '@/hooks/useConsent';
import { ConsentStatus } from '@/components/ui/ConsentStatus';

export function ConsentManagementTable() {
  const { consents, isLoading, error } = useConsent();
  const [selectedConsent, setSelectedConsent] = useState(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2>Consent Management</h2>
      <Table
        data={consents}
        columns={[
          { header: 'User', accessor: 'userName' },
          { header: 'Purpose', accessor: 'purpose' },
          { header: 'Status', accessor: 'status' },
          { header: 'Date', accessor: 'timestamp' },
          { header: 'Actions', accessor: 'actions' },
        ]}
        onRowClick={setSelectedConsent}
      />
      {selectedConsent && (
        <div className="mt-4">
          <h3>Consent Details</h3>
          <ConsentStatus consent={selectedConsent} />
        </div>
      )}
    </div>
  );
}
```

### 3. ComplianceStatus
```typescript
// components/admin/ComplianceStatus.tsx
import { useCompliance } from '@/hooks/useCompliance';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';

export function ComplianceStatus() {
  const { status, metrics, isLoading } = useCompliance();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <h3>Overall Compliance</h3>
        <Progress value={status.overall} />
      </Card>
      <Card>
        <h3>Data Protection</h3>
        <Progress value={status.dataProtection} />
      </Card>
      <Card>
        <h3>User Rights</h3>
        <Progress value={status.userRights} />
      </Card>
    </div>
  );
}
```

## User Profile Components

### 1. ConsentManagement
```typescript
// components/settings/ConsentManagement.tsx
import { useState } from 'react';
import { useConsent } from '@/hooks/useConsent';
import { Switch } from '@/components/ui/Switch';
import { Card } from '@/components/ui/Card';

export function ConsentManagement() {
  const { consents, updateConsent, isLoading } = useConsent();
  const [updating, setUpdating] = useState(false);

  const handleConsentChange = async (purpose: string, granted: boolean) => {
    setUpdating(true);
    try {
      await updateConsent(purpose, granted);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <h2>Consent Management</h2>
      <div className="space-y-4">
        {consents.map((consent) => (
          <div key={consent.purpose} className="flex items-center justify-between">
            <div>
              <h3>{consent.purpose}</h3>
              <p className="text-sm text-gray-500">{consent.description}</p>
            </div>
            <Switch
              checked={consent.granted}
              onChange={(checked) => handleConsentChange(consent.purpose, checked)}
              disabled={updating}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### 2. DataExport
```typescript
// components/settings/DataExport.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useDataExport } from '@/hooks/useDataExport';
import { Card } from '@/components/ui/Card';

export function DataExport() {
  const { exportData, isLoading } = useDataExport();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <h2>Data Export</h2>
      <p className="text-sm text-gray-500 mb-4">
        Download a copy of your personal data
      </p>
      <Button
        onClick={handleExport}
        disabled={isLoading || exporting}
      >
        {exporting ? 'Exporting...' : 'Export Data'}
      </Button>
    </Card>
  );
}
```

### 3. AccountDeletion
```typescript
// components/settings/AccountDeletion.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAccountDeletion } from '@/hooks/useAccountDeletion';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';

export function AccountDeletion() {
  const { deleteAccount, isLoading } = useAccountDeletion();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');

  const handleDelete = async () => {
    try {
      await deleteAccount(reason);
    } finally {
      setShowModal(false);
    }
  };

  return (
    <Card>
      <h2>Account Deletion</h2>
      <p className="text-sm text-gray-500 mb-4">
        Permanently delete your account and all associated data
      </p>
      <Button
        variant="destructive"
        onClick={() => setShowModal(true)}
        disabled={isLoading}
      >
        Delete Account
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete your account?</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for deletion"
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}
```

## Hooks

### 1. useDataInventory
```typescript
// hooks/useDataInventory.ts
import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/lib/services/dataService';

export function useDataInventory() {
  return useQuery({
    queryKey: ['dataInventory'],
    queryFn: () => new DataService().getDataInventory(),
  });
}
```

### 2. useConsent
```typescript
// hooks/useConsent.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ConsentService } from '@/lib/services/consentService';

export function useConsent() {
  const queryClient = useQueryClient();
  const { data: consents, isLoading, error } = useQuery({
    queryKey: ['consents'],
    queryFn: () => new ConsentService().getUserConsent(),
  });

  const { mutate: updateConsent } = useMutation({
    mutationFn: ({ purpose, granted }: { purpose: string; granted: boolean }) =>
      new ConsentService().updateConsent(purpose, granted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    },
  });

  return { consents, isLoading, error, updateConsent };
}
```

### 3. useDataExport
```typescript
// hooks/useDataExport.ts
import { useMutation } from '@tanstack/react-query';
import { DataService } from '@/lib/services/dataService';

export function useDataExport() {
  const { mutate: exportData, isLoading } = useMutation({
    mutationFn: () => new DataService().exportUserData(),
  });

  return { exportData, isLoading };
}
```

## UI Components

### 1. ConsentStatus
```typescript
// components/ui/ConsentStatus.tsx
import { Badge } from '@/components/ui/Badge';

interface ConsentStatusProps {
  consent: {
    granted: boolean;
    timestamp: string;
    withdrawalDate?: string;
  };
}

export function ConsentStatus({ consent }: ConsentStatusProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Badge
          variant={consent.granted ? 'success' : 'destructive'}
        >
          {consent.granted ? 'Granted' : 'Withdrawn'}
        </Badge>
        <span className="text-sm text-gray-500">
          {consent.granted
            ? `Granted on ${new Date(consent.timestamp).toLocaleDateString()}`
            : `Withdrawn on ${new Date(consent.withdrawalDate!).toLocaleDateString()}`}
        </span>
      </div>
    </div>
  );
}
```

### 2. Progress
```typescript
// components/ui/Progress.tsx
interface ProgressProps {
  value: number;
  max?: number;
}

export function Progress({ value, max = 100 }: ProgressProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
```

## Styling

### 1. Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        destructive: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
        },
      },
    },
  },
};
```

### 2. Global Styles
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .button {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }

  .button-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
  }

  .button-destructive {
    @apply bg-red-600 text-white hover:bg-red-700;
  }
}
``` 
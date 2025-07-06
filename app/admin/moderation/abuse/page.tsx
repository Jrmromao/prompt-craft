import { Metadata } from 'next';
import { VoteAbuseManagementDashboard } from '@/components/admin/VoteAbuseManagementDashboard';

export const metadata: Metadata = {
  title: 'Vote Abuse Management - Admin Dashboard',
  description: 'Monitor and manage vote abuse detection system',
};

export default function VoteAbusePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vote Abuse Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor, investigate, and manage vote abuse detection system
          </p>
        </div>
        
        <VoteAbuseManagementDashboard />
      </div>
    </div>
  );
} 
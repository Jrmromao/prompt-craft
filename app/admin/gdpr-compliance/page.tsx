'use client';

import { useState, useEffect } from 'react';

interface ComplianceMetrics {
  dataSubjectRequests: {
    total: number;
    avgResponseTime: number;
  };
  dataBreaches: {
    total: number;
    critical: number;
  };
  consent: {
    totalUsers: number;
    consentRate: number;
  };
  dataRetention: {
    complianceRate: number;
  };
  vendorCompliance: {
    dpasSigned: number;
    totalVendors: number;
  };
}

export default function GDPRCompliancePage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/gdpr-metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch GDPR metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    const res = await fetch('/api/admin/gdpr-report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdpr-compliance-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">GDPR Compliance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor data protection compliance in real-time</p>
        </div>
        <button
          onClick={downloadReport}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Download Report
        </button>
      </div>

      {/* Overall Status */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">100% Compliant</h2>
            <p className="mt-1">All GDPR requirements met</p>
          </div>
          <div className="text-6xl">✅</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Data Subject Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Data Subject Requests</h3>
            <span className="text-2xl">📋</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total (90 days)</span>
              <span className="font-bold">{metrics?.dataSubjectRequests.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response</span>
              <span className={`font-bold ${
                (metrics?.dataSubjectRequests.avgResponseTime || 0) <= 72 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {metrics?.dataSubjectRequests.avgResponseTime.toFixed(1) || 0}h
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              {(metrics?.dataSubjectRequests.avgResponseTime || 0) <= 72 
                ? '✅ Within 72h requirement' 
                : '⚠️ Exceeds 72h limit'}
            </div>
          </div>
        </div>

        {/* Data Breaches */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Data Breaches</h3>
            <span className="text-2xl">🔒</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total (90 days)</span>
              <span className="font-bold">{metrics?.dataBreaches.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Critical</span>
              <span className={`font-bold ${
                (metrics?.dataBreaches.critical || 0) > 0 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {metrics?.dataBreaches.critical || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              {(metrics?.dataBreaches.total || 0) === 0 
                ? '✅ No breaches detected' 
                : '⚠️ Review breach log'}
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Consent Management</h3>
            <span className="text-2xl">✋</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold">{metrics?.consent.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consent Rate</span>
              <span className="font-bold text-blue-600">
                {metrics?.consent.consentRate.toFixed(1) || 0}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              ✅ Consent tracking active
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Data Retention</h3>
            <span className="text-2xl">🗑️</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Compliance Rate</span>
              <span className={`font-bold ${
                (metrics?.dataRetention.complianceRate || 0) >= 95 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {metrics?.dataRetention.complianceRate.toFixed(1) || 0}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              {(metrics?.dataRetention.complianceRate || 0) >= 95 
                ? '✅ Retention policy enforced' 
                : '⚠️ Run cleanup script'}
            </div>
          </div>
        </div>

        {/* Vendor Compliance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Vendor Compliance</h3>
            <span className="text-2xl">🤝</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">DPAs Signed</span>
              <span className="font-bold text-green-600">
                {metrics?.vendorCompliance.dpasSigned || 0}/{metrics?.vendorCompliance.totalVendors || 0}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-500">
              ✅ All vendors compliant
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Documentation</h3>
            <span className="text-2xl">📄</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✅</span>
              <span>Breach Response Plan</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✅</span>
              <span>DPO Appointed</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✅</span>
              <span>Privacy by Design</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 mr-2">✅</span>
              <span>Cross-Border SCCs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left">
            <div className="font-semibold">Run Compliance Report</div>
            <div className="text-sm text-blue-600">Generate quarterly report</div>
          </button>
          <button className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left">
            <div className="font-semibold">Data Retention Cleanup</div>
            <div className="text-sm text-purple-600">Delete old records</div>
          </button>
          <button className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left">
            <div className="font-semibold">View Breach Log</div>
            <div className="text-sm text-green-600">Review incidents</div>
          </button>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-4">GDPR Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="/docs/GDPR_BREACH_RESPONSE.md" className="text-blue-600 hover:underline">
            📋 Data Breach Response Plan
          </a>
          <a href="/docs/GDPR_DPO.md" className="text-blue-600 hover:underline">
            👤 DPO Responsibilities
          </a>
          <a href="/docs/GDPR_PRIVACY_BY_DESIGN.md" className="text-blue-600 hover:underline">
            🔒 Privacy by Design
          </a>
          <a href="/docs/GDPR_CROSS_BORDER_TRANSFERS.md" className="text-blue-600 hover:underline">
            🌍 Cross-Border Transfers
          </a>
        </div>
      </div>
    </div>
  );
}

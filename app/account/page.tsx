'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface DbUser {
  planType: string;
  monthlyCredits: number;
  purchasedCredits: number;
  role: string;
}

interface SubscriptionInfo {
  status: string;
  currentPeriodEnd: string;
  planName: string;
  cancelAtPeriodEnd?: boolean;
}

interface UsageStats {
  promptsCreated: number;
  creditsUsed: number;
  lastActivity: string;
}

interface BillingInfo {
  invoices: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    invoice_pdf?: string;
  }>;
  paymentMethods: Array<{
    id: string;
    type: string;
    last4?: string;
    brand?: string;
  }>;
  nextPayment?: {
    amount: number;
    date: string;
  };
}

export default function AccountPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn && user) {
      fetchAccountData();
    }
  }, [isSignedIn, user]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userResponse = await fetch('/api/auth/user');
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.success) {
          setDbUser({
            planType: userData.data.user.planType,
            monthlyCredits: userData.data.user.credits.monthly,
            purchasedCredits: userData.data.user.credits.purchased,
            role: userData.data.user.role,
          });
        } else {
          console.error('User API returned error:', userData.error);
        }
      } else {
        const errorText = await userResponse.text();
        console.error('User API failed:', userResponse.status, errorText);
      }

      // Fetch subscription info
      const subResponse = await fetch('/api/account/subscription');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      // Fetch usage stats
      const usageResponse = await fetch('/api/account/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData);
      }

      // Fetch billing info
      const billingResponse = await fetch('/api/account/billing');
      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        setBilling(billingData);
      }
    } catch (error) {
      console.error('Failed to fetch account data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Not Signed In</h1>
        <a href="/sign-in" className="text-blue-500">Sign In</a>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {user.imageUrl && (
                <img src={user.imageUrl} alt="Profile" className="w-12 h-12 rounded-full" />
              )}
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-gray-600 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
            </div>
            <div className="pt-2 border-t">
              <p><strong>User ID:</strong> <span className="text-xs text-gray-500">{user.id}</span></p>
              <p><strong>Member Since:</strong> {new Date(user.createdAt!).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          {loading ? (
            <p>Loading account details...</p>
          ) : dbUser ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Plan:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  dbUser.planType === 'PRO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {dbUser.planType}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Credits:</span>
                <span className="font-medium">{dbUser.monthlyCredits}</span>
              </div>
              <div className="flex justify-between">
                <span>Purchased Credits:</span>
                <span className="font-medium">{dbUser.purchasedCredits}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total Credits:</span>
                <span className="font-bold text-green-600">{dbUser.monthlyCredits + dbUser.purchasedCredits}</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{dbUser.role}</span>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load account details</p>
          )}
        </div>

        {/* Subscription Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Subscription</h2>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">{subscription.planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Renews:</span>
                <span className="text-sm">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                  ⚠️ Subscription will cancel at period end
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No active subscription</p>
          )}
        </div>

        {/* Usage Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Usage Statistics</h2>
          {usage ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Prompts Created:</span>
                <span className="font-medium">{usage.promptsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span>Credits Used:</span>
                <span className="font-medium">{usage.creditsUsed}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Activity:</span>
                <span className="text-sm">{usage.lastActivity}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading usage stats...</p>
          )}
        </div>
      </div>

      {/* Billing & Payments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Billing & Payments</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <button className="text-blue-500 hover:text-blue-700 text-sm">+ Add New</button>
            </div>
            {billing?.paymentMethods && billing.paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {billing.paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                        💳
                      </div>
                      <div>
                        <p className="font-medium">{method.brand?.toUpperCase()} •••• {method.last4}</p>
                        <p className="text-sm text-gray-500">{method.type}</p>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No payment methods on file</p>
            )}
          </div>

          {/* Next Payment */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Next Payment</h3>
            {billing?.nextPayment ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${(billing.nextPayment.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="text-sm">{billing.nextPayment.date}</span>
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Update Payment Method
                </button>
              </div>
            ) : (
              <p className="text-gray-500">No upcoming payments</p>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
            <button className="text-blue-500 hover:text-blue-700 text-sm">View All</button>
          </div>
          {billing?.invoices && billing.invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.invoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3">{new Date(invoice.created * 1000).toLocaleDateString()}</td>
                      <td className="py-3">${(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {invoice.invoice_pdf && (
                          <a 
                            href={invoice.invoice_pdf} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Download PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No invoices found</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex space-x-4">
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Edit Profile
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Upgrade Plan
        </button>
        <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Download Data
        </button>
      </div>

      <div className="mt-6 p-4 bg-green-100 rounded">
        <p className="text-green-800">✅ Enhanced account page with subscription and usage info!</p>
      </div>
    </div>
  );
}

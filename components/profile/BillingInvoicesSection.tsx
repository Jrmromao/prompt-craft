import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Invoice {
  id: string;
  amount: string;
  date: string;
  url: string;
  status: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const months = ['June 2025', 'May 2025', 'April 2025']; // You can make this dynamic if needed

interface UsageMetrics {
  metrics: {
    prompts: number;
    tokens: number;
    team_members: number;
  };
  limits: {
    maxPrompts: number;
    maxTokens: number;
    maxTeamMembers: number;
  };
  usagePercentages: {
    prompts: number;
    tokens: number;
    teamMembers: number;
  };
}

export default function BillingInvoicesSection() {
  const { data: billingData, error: billingError, isLoading: billingLoading } = useSWR('/api/billing/overview', fetcher);
  const { data: usageData, error: usageError, isLoading: usageLoading } = useSWR<UsageMetrics>('/api/usage', fetcher);
  const [selectedMonth, setSelectedMonth] = useState(months[0]);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsInvoicesLoading(true);
      setError(null);
      const response = await fetch('/api/billing/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      const data = await response.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load invoice history');
      toast({
        title: 'Error',
        description: 'Failed to load invoice history. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  const handlePortalAccess = async () => {
    setIsPortalLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/billing/portal');
      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }
      const data = await response.json();
      if (data.url) {
        toast({
          title: 'Redirecting',
          description: 'You are being redirected to the billing portal.',
        });
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      setError('Failed to access billing portal');
      toast({
        title: 'Error',
        description: 'Failed to access billing portal. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (billingLoading || usageLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading billing info...</div>;
  }
  if (billingError || usageError || !billingData || !usageData) {
    return <div className="p-8 text-center text-red-500">Failed to load billing info.</div>;
  }

  const { subscription, invoices: billingInvoices } = billingData;
  const { metrics, limits, usagePercentages } = usageData;

  // Debug log
  console.log('Usage Data:', usageData);

  // Stripe subscription parsing
  const plan = subscription?.items?.data?.[0]?.price?.nickname || 'Unknown';
  const price = subscription?.items?.data?.[0]?.price?.unit_amount ? (subscription.items.data[0].price.unit_amount / 100).toFixed(2) : '0.00';
  const renewal = subscription?.current_period_end
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : '-';

  // Filter invoices by month (for now, all invoices are shown)
  const filteredInvoices = billingInvoices || [];

  return (
    <section className="flex flex-col gap-8">
      {/* Subscription and Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Card */}
        <div className="rounded-xl bg-muted p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">{plan} • Subscription</div>
            <button
              className="rounded bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePortalAccess}
              disabled={isPortalLoading}
            >
              {isPortalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Loading...
                </>
              ) : (
                'Manage Subscription'
              )}
            </button>
          </div>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <div className="text-sm text-muted-foreground">Renews: {renewal}</div>
        </div>

        {/* Usage Card */}
        <div className="rounded-xl bg-muted p-6 shadow-sm">
          <h3 className="font-semibold mb-4">Usage Overview</h3>
          <div className="space-y-4">
            {/* Prompts Usage */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Prompts</span>
                <span className="text-sm">{metrics.prompts} / {limits.maxPrompts}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercentages.prompts, 100)}%` }}
                />
              </div>
            </div>

            {/* Tokens Usage */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Tokens</span>
                <span className="text-sm">{metrics.tokens} / {limits.maxTokens}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercentages.tokens, 100)}%` }}
                />
              </div>
            </div>

            {/* Team Members Usage */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Team Members</span>
                <span className="text-sm">{metrics.team_members} / {limits.maxTeamMembers}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.min(usagePercentages.teamMembers, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">View month:</span>
            <select
              className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto rounded-lg bg-muted p-4">
          {isInvoicesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices found</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Amount</th>
                  <th className="px-3 py-2 text-left font-semibold">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv: any, i: number) => (
                  <tr key={i} className="border-t border-border">
                    <td className="whitespace-nowrap px-3 py-2">{inv.created ? new Date(inv.created * 1000).toLocaleDateString() : '-'}</td>
                    <td className="px-3 py-2 capitalize">{inv.status}</td>
                    <td className="px-3 py-2">{inv.amount_paid ? (inv.amount_paid / 100).toFixed(2) : '0.00'} {inv.currency ? inv.currency.toUpperCase() : 'USD'}</td>
                    <td className="px-3 py-2">
                      {inv.invoice_pdf ? (
                        <a
                          href={inv.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 underline hover:text-purple-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17v.2A2.8 2.8 0 0 0 9.8 20h4.4A2.8 2.8 0 0 0 17 17.2V17m-5-4 4-4m0 0-4-4m4 4H3"/></svg>
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
} 
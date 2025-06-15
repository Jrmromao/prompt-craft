import React, { useState } from 'react';
import { Loader2, CreditCard, Building2, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Invoice {
  id: string;
  amount: string;
  date: string;
  url: string | null;
  status: string;
  type: 'subscription' | 'credit_purchase';
}

interface EnterpriseBillingSectionProps {
  billingData: {
    subscription: {
      status: string;
      current_period_end: number;
      items: {
        data: Array<{
          price: {
            nickname: string;
            unit_amount: number;
          };
        }>;
      };
    } | null;
    invoices: Invoice[];
    paymentMethods: any[];
    credits: {
      monthly: number;
      purchased: number;
      total: number;
    };
  };
}

export default function EnterpriseBillingSection({ billingData }: EnterpriseBillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/portal');
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const plan = billingData.subscription?.items?.data?.[0]?.price?.nickname || 'Enterprise';
  const price = billingData.subscription?.items?.data?.[0]?.price?.unit_amount 
    ? (billingData.subscription.items.data[0].price.unit_amount / 100).toFixed(2)
    : '0.00';
  const renewal = billingData.subscription?.current_period_end
    ? new Date(billingData.subscription.current_period_end * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Enterprise Subscription</h2>
            <p className="text-gray-600">Active Plan</p>
          </div>
          <Button 
            onClick={handleManageSubscription} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Manage Subscription
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Current Plan</p>
            <p className="text-2xl font-bold">{plan}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Price</p>
            <p className="text-2xl font-bold">${price}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Next Billing Date</p>
            <p className="text-2xl font-bold">{renewal}</p>
          </div>
        </div>
      </Card>

      {/* Credits Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Credits Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Monthly Credits</p>
            <p className="text-2xl font-bold">{billingData.credits.monthly}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Purchased Credits</p>
            <p className="text-2xl font-bold">{billingData.credits.purchased}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Credits</p>
            <p className="text-2xl font-bold">{billingData.credits.total}</p>
          </div>
        </div>
      </Card>

      {/* Enterprise Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enterprise Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Building2 className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-2">Dedicated Support</h3>
            <p className="text-sm text-gray-600">24/7 priority support with dedicated account manager</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold mb-2">Team Management</h3>
            <p className="text-sm text-gray-600">Advanced team controls and role-based access</p>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        {billingData.invoices.length > 0 ? (
          <div className="space-y-4">
            {billingData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {invoice.type === 'credit_purchase' ? 'Credit Purchase' : 'Subscription Payment'}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${invoice.amount}</p>
                  <p className="text-sm text-gray-600 capitalize">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No billing history available.</p>
        )}
      </Card>
    </div>
  );
} 
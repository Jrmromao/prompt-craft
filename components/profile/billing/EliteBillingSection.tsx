import React, { useState } from 'react';
import { Loader2, CreditCard, Crown, Shield } from 'lucide-react';
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

interface EliteBillingSectionProps {
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

export default function EliteBillingSection({ billingData }: EliteBillingSectionProps) {
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

  const plan = billingData.subscription?.items?.data?.[0]?.price?.nickname || 'Elite';
  const price = billingData.subscription?.items?.data?.[0]?.price?.unit_amount 
    ? (billingData.subscription.items.data[0].price.unit_amount / 100).toFixed(2)
    : '0.00';
  const renewal = billingData.subscription?.current_period_end
    ? new Date(billingData.subscription.current_period_end * 1000).toLocaleDateString()
    : 'N/A';

  return (
    <div className="space-y-6 font-inter" role="region" aria-label="Elite Billing Overview">
      {/* Subscription Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold font-inter">Elite Subscription</h2>
            <p className="text-gray-600 font-inter">Active Plan</p>
          </div>
          <Button 
            onClick={handleManageSubscription} 
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-inter"
            aria-label="Manage Subscription"
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
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Current Plan</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{plan}</p>
          </div>
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Monthly Price</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${price}</p>
          </div>
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Next Billing Date</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{renewal}</p>
          </div>
        </div>
      </Card>


      {/* Elite Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Elite Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg">
            <Crown className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-semibold mb-2 font-inter">Premium Support</h3>
            <p className="text-sm text-gray-600 font-inter">Priority support with dedicated account manager</p>
          </div>
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg">
            <Shield className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-semibold mb-2 font-inter">Advanced Security</h3>
            <p className="text-sm text-gray-600 font-inter">Enhanced security features and compliance</p>
          </div>
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Billing History</h2>
        {billingData.invoices.length > 0 ? (
          <div className="space-y-4" role="list" aria-label="Billing history">
            {billingData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-lg" role="listitem">
                <div>
                  <p className="font-medium font-inter">
                    {invoice.type === 'credit_purchase' ? 'Credit Purchase' : 'Subscription Payment'}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium font-inter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">${invoice.amount}</p>
                  <p className="text-sm text-gray-600 font-inter capitalize">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 font-inter">No billing history available.</p>
        )}
      </Card>
    </div>
  );
} 
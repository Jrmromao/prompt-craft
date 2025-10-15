import React, { useState } from 'react';
import { Loader2, CreditCard, CheckCircle, Coins, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditPurchaseDialog } from '@/app/components/profile/CreditPurchaseDialog';

interface Invoice {
  id: string;
  amount: string;
  date: string;
  url: string | null;
  status: string;
  type: 'subscription' | 'credit_purchase';
}

interface ProBillingSectionProps {
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

export default function ProBillingSection({ billingData }: ProBillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
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

  const plan = billingData.subscription?.items?.data?.[0]?.price?.nickname || 'Pro';
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
            <h2 className="text-xl font-semibold font-inter">Pro Subscription</h2>
            <p className="text-gray-600 font-inter">Active Plan</p>
          </div>
          <Button 
            onClick={handleManageSubscription} 
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-white font-inter"
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
            <p className="text-sm text-gray-600 font-inter">Current Plan</p>
            <p className="text-2xl font-bold font-inter">{plan}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Monthly Price</p>
            <p className="text-2xl font-bold font-inter">${price}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Next Billing Date</p>
            <p className="text-2xl font-bold font-inter">{renewal}</p>
          </div>
        </div>
      </Card>

      {/* Credits Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Credits Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Monthly Credits</p>
            <p className="text-2xl font-bold font-inter">{billingData.credits.monthly}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Purchased Credits</p>
            <p className="text-2xl font-bold font-inter">{billingData.credits.purchased}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-inter">Total Credits</p>
            <p className="text-2xl font-bold font-inter">{billingData.credits.total}</p>
          </div>
        </div>
      </Card>

      {/* Buy Credits Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50/80 to-blue-50/80 dark:from-blue-950/20 dark:to-blue-950/20">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 font-inter">Need More Credits?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-inter">
              Purchase additional credits to unlock unlimited test runs and create public prompts. 
              <span className="font-semibold">Additional private prompts are only available on Enterprise and Elite plans.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => setIsCreditDialogOpen(true)} 
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-white font-inter flex-1"
                aria-label="Buy additional credits"
              >
                <Coins className="w-4 h-4 mr-2" />
                Buy Credits
              </Button>
              <Button
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-white font-inter flex-1"
                aria-label="Upgrade Plan"
              >
                <ArrowUpRight className="w-4 h-4 mr-2 text-white" />
                Upgrade Plan
              </Button>
            </div>
          </div>
          <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
      </Card>

      {/* Billing History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Billing History</h2>
        {billingData.invoices.length > 0 ? (
          <div className="space-y-4">
            {billingData.invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium font-inter">
                    {invoice.type === 'credit_purchase' ? 'Credit Purchase' : 'Subscription Payment'}
                  </p>
                  <p className="text-sm text-gray-600 font-inter">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium font-inter">${invoice.amount}</p>
                  <p className="text-sm text-gray-600 font-inter capitalize">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 font-inter">No billing history available.</p>
        )}
      </Card>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog 
        isOpen={isCreditDialogOpen}
        onClose={() => setIsCreditDialogOpen(false)}
        isFreePlan={false}
      />
    </div>
  );
} 
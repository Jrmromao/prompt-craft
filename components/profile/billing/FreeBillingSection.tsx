import React, { useState } from 'react';
import { Loader2, CreditCard, AlertTriangle, Coins } from 'lucide-react';
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

interface FreeBillingSectionProps {
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

export default function FreeBillingSection({ billingData }: FreeBillingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCreditDialogOpen, setIsCreditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  // Safely access credits with default values
  const credits = billingData.credits || {
    monthly: 0,
    purchased: 0,
    total: 0
  };

  return (
    <div className="space-y-6" role="region" aria-label="Billing Overview">
      {/* Credits Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Credits Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg" role="group" aria-label="Monthly Credits">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Monthly Credits</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{credits.monthly}</p>
          </div>
          <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg" role="group" aria-label="Purchased Credits">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Purchased Credits</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{credits.purchased}</p>
          </div>
          <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg" role="group" aria-label="Total Credits">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">Total Credits</p>
            <p className="text-2xl font-bold font-inter bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{credits.total}</p>
          </div>
        </div>
      </Card>

      {/* Upgrade and Buy Credits Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50/80 to-blue-50/80 dark:from-blue-950/20 dark:to-blue-950/20">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <h3 className="text-lg font-semibold mb-2 font-inter">Need More Credits?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 font-inter">
              Choose between upgrading your plan for more monthly credits or purchasing additional credits as needed.
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
                onClick={handleUpgrade} 
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-inter flex-1"
                aria-label="View available plans"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </div>
          </div>
          <AlertTriangle className="h-6 w-6 text-yellow-500" aria-hidden="true" />
        </div>
      </Card>

      {/* Credit Purchase History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-inter">Credit Purchase History</h2>
        {billingData.invoices?.length > 0 ? (
          <div className="space-y-4" role="list" aria-label="Purchase history">
            {billingData.invoices.map((invoice) => (
              <div 
                key={invoice.id} 
                className="flex items-center justify-between p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg"
                role="listitem"
              >
                <div>
                  <p className="font-medium font-inter">
                    {invoice.type === 'credit_purchase' ? 'Credit Purchase' : 'Subscription Payment'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                    {new Date(invoice.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium font-inter bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">${invoice.amount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-inter capitalize">{invoice.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 font-inter">No credit purchases yet.</p>
        )}
      </Card>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog 
        isOpen={isCreditDialogOpen}
        onClose={() => setIsCreditDialogOpen(false)}
        isFreePlan={true}
      />
    </div>
  );
} 
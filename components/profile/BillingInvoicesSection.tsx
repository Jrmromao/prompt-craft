import React from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FreeBillingSection from './billing/FreeBillingSection';
import ProBillingSection from './billing/ProBillingSection';
import EnterpriseBillingSection from './billing/EnterpriseBillingSection';
import EliteBillingSection from './billing/EliteBillingSection';

interface Invoice {
  id: string;
  amount: string;
  date: string;
  url: string | null;
  status: string;
  type: 'subscription' | 'credit_purchase';
}

interface BillingData {
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
}

interface FetchError extends Error {
  info?: any;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('Failed to fetch billing data') as FetchError;
    error.info = await response.json();
    throw error;
  }
  return response.json();
};

export default function BillingInvoicesSection() {
  const { data: billingData, error, isLoading } = useSWR<BillingData>('/api/billing/overview', fetcher);
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch billing information. Please try again.',
      variant: 'destructive',
    });
    return null;
  }

  if (!billingData) {
    return null;
  }

  // Ensure credits data is available with default values
  const billingDataWithCredits = {
    ...billingData,
    credits: billingData.credits || {
      monthly: 0,
      purchased: 0,
      total: 0
    }
  };

  const planType = billingData.subscription?.items?.data?.[0]?.price?.nickname?.toLowerCase() || 'free';


  switch (planType) {
    case 'pro':
      return <ProBillingSection billingData={billingDataWithCredits} />;    
    case 'enterprise':  
      return <EnterpriseBillingSection billingData={billingDataWithCredits} />;
    case 'elite':
      return <EliteBillingSection billingData={billingDataWithCredits} />;
    default:
      return <FreeBillingSection billingData={billingDataWithCredits} />;
  }
}
// components/BillingPageClient.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SubscribeButton } from '@/components/SubscribeButton';
import { Button } from '@/components/ui/button';
import {
  Check,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  BarChart,
  Sparkles,
  Calendar,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface SubscriptionInfo {
  isSubscribed?: boolean;
  tier?: string;
  status?: string;
  currentPeriodEnd?: Date;
}

export function BillingPageClient({ subscription }: { subscription?: SubscriptionInfo }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  // Safely handle undefined subscription
  const safeSubscription = subscription || {};

  const showSuccessMessage = searchParams.get('success') === 'true';
  const showCanceledMessage = searchParams.get('canceled') === 'true';
  const showRequiredMessage = searchParams.get('required') === 'true';

  const isActive = Boolean(safeSubscription.isSubscribed) && safeSubscription.status === 'ACTIVE';
  const isPastDue = safeSubscription.status === 'PAST_DUE';
  const isInactive = !safeSubscription.isSubscribed || safeSubscription.status === 'INACTIVE';

  const handleGoToDashboard = () => {
    setIsLoading(true);
    router.push('/account');
  };

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate yearly savings
  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlySavings = Math.round(((monthlyPrice * 12 - yearlyPrice) / (monthlyPrice * 12)) * 100);

  // Features list
  const features = [
    'Unlimited patients',
    'All phoneme exercises',
    'Progress tracking',
    'Priority support',
    'Material for printing',
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold text-blue-900 dark:text-white">
        {showRequiredMessage ? 'Subscription Required' : 'Subscription Plan'}
      </h1>

      {!isInactive && (
        <p className="mb-6 text-blue-700 dark:text-blue-300">
          Manage your subscription and billing details
        </p>
      )}

      {/* Notification Banners */}
      {showSuccessMessage && (
        <div className="mb-8 flex items-start rounded-lg bg-green-50 p-4 text-green-700">
          <CheckCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Thank you for subscribing!</p>
            <p>Your subscription is now active. You can now access all premium features.</p>
          </div>
        </div>
      )}

      {showCanceledMessage && (
        <div className="mb-8 flex items-start rounded-lg bg-yellow-50 p-4 text-yellow-700">
          <AlertTriangle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Checkout canceled</p>
            <p>Your subscription process was canceled. Please try again when you're ready.</p>
          </div>
        </div>
      )}

      {showRequiredMessage && (
        <div className="mb-8 flex items-start rounded-lg bg-blue-50 p-4 text-blue-700">
          <AlertTriangle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Subscription Required</p>
            <p>
              A subscription is required to access premium features. Please subscribe below to
              continue.
            </p>
          </div>
        </div>
      )}

      {isPastDue && (
        <div className="mb-8 flex items-start rounded-lg bg-amber-50 p-4 text-amber-700">
          <Clock className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Payment issue detected</p>
            <p>
              There was a problem with your latest payment. Please update your payment method to
              avoid service interruption.
            </p>
            <Button
              variant="outline"
              className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => {
                /* Add payment update flow */
              }}
            >
              Update payment method
            </Button>
          </div>
        </div>
      )}

      {/* Active Subscription Status Card */}
      {!isInactive && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-white p-6 shadow-xl shadow-blue-500/5 dark:border-indigo-800 dark:bg-indigo-900 dark:shadow-indigo-950/10">
          <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-white">
            Subscription Status
          </h2>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-indigo-800/50">
              <p className="mb-1 text-sm text-blue-600 dark:text-blue-300">Plan</p>
              <p className="flex items-center font-medium text-blue-900 dark:text-white">
                <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                FonoSaaS Pro
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-indigo-800/50">
              <p className="mb-1 text-sm text-blue-600 dark:text-blue-300">Status</p>
              <p
                className={`flex items-center font-medium ${isPastDue ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}
              >
                {isPastDue ? (
                  <Clock className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {isPastDue ? 'Payment required' : 'Active'}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-indigo-800/50">
              <p className="mb-1 text-sm text-blue-600 dark:text-blue-300">Renewal date</p>
              <p className="font-medium text-blue-900 dark:text-white">
                {formatDate(safeSubscription.currentPeriodEnd)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleGoToDashboard}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20"
              disabled={isLoading}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 dark:border-indigo-700 dark:text-blue-300"
              onClick={() => {
                /* Add manage subscription flow */
              }}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage subscription
            </Button>
          </div>
        </div>
      )}

      {/* Billing Toggle (only for non-subscribed users) */}
      {isInactive && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full bg-blue-50 p-1 dark:bg-indigo-900/40">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`flex items-center rounded-full px-4 py-2 text-sm transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white font-medium text-blue-700 shadow-sm dark:bg-indigo-800 dark:text-white'
                  : 'text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white'
              }`}
            >
              <Calendar size={16} className="mr-1.5" />
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`flex items-center rounded-full px-4 py-2 text-sm transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-white font-medium text-blue-700 shadow-sm dark:bg-indigo-800 dark:text-white'
                  : 'text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-white'
              }`}
            >
              <Calendar size={16} className="mr-1.5" />
              Yearly
              <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                -{yearlySavings}%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Subscription Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-xl shadow-blue-500/5 dark:border-indigo-800 dark:bg-indigo-900 dark:shadow-indigo-950/10"
      >
        {/* Card Banner */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="mb-2 inline-block rounded-full bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                Full Access
              </span>
              <h3 className="text-xl font-bold text-white">FonoSaaS Pro</h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {isInactive && (
            <div className="mb-6 text-center">
              <div className="mb-1 text-sm text-blue-600 dark:text-blue-300">
                {billingInterval === 'monthly' ? 'Monthly billing' : 'Annual billing'}
              </div>
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold text-blue-900 dark:text-white">
                  ${billingInterval === 'monthly' ? monthlyPrice : yearlyPrice}
                </span>
                <span className="ml-1 text-blue-600 dark:text-blue-300">
                  /{billingInterval === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingInterval === 'yearly' && (
                <div className="mt-1 text-sm text-green-600 dark:text-green-400">
                  Save ${(monthlyPrice * 12 - yearlyPrice).toFixed(2)} per year
                </div>
              )}
            </div>
          )}

          <div className="mb-8 space-y-4">
            <div className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-900 dark:text-blue-100">
              Includes:
            </div>
            {features.map((feature, i) => (
              <div key={i} className="flex items-start">
                <div className="mt-0.5 flex-shrink-0">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Check size={14} />
                  </div>
                </div>
                <span className="ml-3 text-blue-700 dark:text-blue-300">{feature}</span>
              </div>
            ))}
          </div>

          {isActive ? (
            <div className="space-y-3">
              <Button
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-6 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20"
                onClick={handleGoToDashboard}
                disabled={isLoading}
              >
                <BarChart size={18} className="mr-2" />
                {isLoading ? 'Loading...' : 'Go to Dashboard'}
              </Button>

              <Button
                className="flex w-full items-center justify-center rounded-xl bg-blue-50 py-6 font-medium text-blue-700 transition-all hover:bg-blue-100 dark:bg-indigo-800/50 dark:text-blue-100 dark:hover:bg-indigo-800"
                onClick={() => {
                  /* Add manage subscription flow */
                }}
              >
                <CreditCard size={18} className="mr-2" />
                Manage Subscription
              </Button>
            </div>
          ) : isPastDue ? (
            <Button
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-red-500 py-6 font-medium text-white transition-all hover:shadow-lg hover:shadow-amber-500/20"
              onClick={() => {
                /* Add payment update flow */
              }}
            >
              <CreditCard size={18} className="mr-2" />
              Update Payment Method
            </Button>
          ) : (
            <SubscribeButton
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-6 font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-purple-800/20"
              priceId={
                billingInterval === 'monthly'
                  ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
                  : process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID
              }
            />
          )}

          <div className="mt-4 text-center text-xs text-blue-500 dark:text-blue-400">
            Cancel anytime. No hidden fees.
          </div>
        </div>
      </motion.div>
    </div>
  );
}

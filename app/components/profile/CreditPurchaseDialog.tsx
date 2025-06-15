'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, CreditCard, Info, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { CREDIT_PACKAGES, type CreditPackage } from '@/app/constants/credits';

interface CreditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isFreePlan?: boolean;
}

export function CreditPurchaseDialog({ isOpen, onClose, isFreePlan = false }: CreditPurchaseDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackage.amount,
          price: selectedPackage.price,
        }),
      });
      if (!response.ok) throw new Error('Failed to initiate purchase');
      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <div className="relative overflow-visible">
          {/* Header */}
          <div className="p-4 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-full bg-purple-50">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                Purchase Credits
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-purple-500 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] p-3">
                      <p className="text-sm">Credits are used to power our AI models. Each model uses a different amount of credits per request.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Credit Options */}
            <div className={isFreePlan ? "grid grid-cols-1 gap-3 w-full" : "flex flex-col gap-3"}>
              {CREDIT_PACKAGES.map((pkg) => (
                <motion.button
                  key={pkg.amount}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative flex items-center justify-between w-full rounded-xl border p-3 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400
                    ${selectedPackage.amount === pkg.amount 
                      ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg scale-[1.01]' 
                      : 'hover:bg-muted/50 border-gray-200'}
                    ${pkg.popular ? 'ring-2 ring-pink-400/40' : ''}
                  `}
                  onClick={() => setSelectedPackage(pkg)}
                  aria-pressed={selectedPackage.amount === pkg.amount}
                  aria-checked={selectedPackage.amount === pkg.amount}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedPackage(pkg);
                  }}
                  role="radio"
                >
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {pkg.amount.toLocaleString()} Credits
                      </span>
                      {pkg.bonus > 0 && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          +{pkg.bonus.toLocaleString()} bonus
                        </span>
                      )}
                      {pkg.popular && (
                        <span className="ml-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white shadow">Popular</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${pkg.price.toFixed(2)} <span className="mx-1">•</span> ${(pkg.price / (pkg.amount + pkg.bonus)).toFixed(3)} per credit
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all
                        ${selectedPackage.amount === pkg.amount 
                          ? 'border-purple-600 bg-purple-600 shadow-[0_0_0_4px_rgba(168,85,247,0.1)]' 
                          : 'border-gray-300 bg-white'}
                      `}
                    >
                      {selectedPackage.amount === pkg.amount && <span className="block h-2.5 w-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Summary Section */}
            <div className="rounded-xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-3 flex flex-col md:flex-row items-center justify-between gap-3 border border-purple-100">
              <div className="flex flex-col items-center md:items-start">
                <div className="font-medium text-sm text-muted-foreground">Total Credits</div>
                <div className="text-lg font-bold text-foreground">
                  {selectedPackage.amount.toLocaleString()} 
                  <span className="text-green-600 font-semibold ml-1">+ {selectedPackage.bonus.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-px h-8 bg-purple-200 hidden md:block" />
              <div className="flex flex-col items-center md:items-end">
                <div className="font-medium text-sm text-muted-foreground">Total Price</div>
                <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ${selectedPackage.price.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Trust & Security */}
            <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <div className="p-1 rounded-full bg-green-50">
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </div>
              <span>Secure payment powered by Stripe</span>
              <img src="/stripe-logo.svg" alt="Stripe" className="h-4 ml-1" />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50/50">
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={handlePurchase}
                disabled={isLoading}
                aria-label="Buy Credits (No Subscription Required)"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Buy Credits Now
                <ShieldCheck className="ml-2 h-5 w-5 text-white" />
              </Button>
              <div className="flex items-center gap-2 justify-center">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  No subscription required
                </span>
                <span className="text-xs text-muted-foreground">100% Secure</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
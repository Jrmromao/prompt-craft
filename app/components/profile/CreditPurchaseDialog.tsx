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
// import Confetti from 'react-confetti';
import { useEffect, useRef } from 'react';

interface CreditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isFreePlan?: boolean;
}

export function CreditPurchaseDialog({ isOpen, onClose, isFreePlan = false, currentBalance = 0, creditCap = 10000 }: CreditPurchaseDialogProps & { currentBalance?: number, creditCap?: number }) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus management
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  // Announce dialog open/close
  useEffect(() => {
    if (isOpen) {
      const live = document.getElementById('dialog-live-region');
      if (live) live.textContent = 'Add Credits dialog opened';
    } else {
      const live = document.getElementById('dialog-live-region');
      if (live) live.textContent = 'Dialog closed';
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
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
      setShowConfetti(true);
      setSuccess(true);
      setTimeout(() => {
        router.push(url);
      }, 1800);
    } catch (error) {
      setError('Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Warn if near credit cap
  const nearCap = currentBalance + selectedPackage.amount + selectedPackage.bonus > creditCap * 0.9;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={dialogRef} className="max-w-xl p-0 gap-0 outline-none" aria-modal="true" role="dialog" tabIndex={-1}>
        <div id="dialog-live-region" className="sr-only" aria-live="polite" />
        {/* {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={200} recycle={false} />} */}
        <div className="relative overflow-visible">
          {/* Header */}
          <div className="p-4 pb-2 border-b border-gray-100 flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-50">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Add Credits</h2>
          </div>

          {/* Success State */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="mb-4">
                <Sparkles className="h-12 w-12 text-green-500 animate-bounce" />
              </div>
              <div className="text-2xl font-bold text-green-700 mb-2">Purchase Successful!</div>
              <div className="text-base text-muted-foreground mb-2 text-center">Your credits will be added after payment.<br />Thank you for your purchase!</div>
              <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 text-base font-semibold shadow-md" onClick={onClose}>Close</Button>
              <a href="/account?tab=usage" className="mt-2 text-blue-600 underline hover:text-blue-500 text-sm">View Usage</a>
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Warning if near cap */}
                {nearCap && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-yellow-600" />
                    You are near your credit cap. Some credits may not be added.
                  </div>
                )}
                {/* Credit Options */}
                <div className={isFreePlan ? "grid grid-cols-1 gap-3 w-full" : "flex flex-col gap-3"}>
                  {CREDIT_PACKAGES.map((pkg) => (
                    <motion.button
                      key={pkg.amount}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative flex items-center justify-between w-full rounded-xl border p-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400
                        ${selectedPackage.amount === pkg.amount 
                          ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-blue-50 shadow-lg scale-[1.01]' 
                          : 'hover:bg-muted/50 border-gray-200'}
                        ${pkg.popular ? 'ring-2 ring-blue-400/40' : ''}
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
                          <span className="font-semibold text-base bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            {pkg.amount.toLocaleString()} Credits
                          </span>
                          {pkg.bonus > 0 && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              +{pkg.bonus.toLocaleString()} bonus
                            </span>
                          )}
                          {pkg.popular && (
                            <span className="ml-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 px-2 py-0.5 text-xs font-semibold text-white shadow">Popular</span>
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
                              ? 'border-blue-600 bg-blue-600 shadow-[0_0_0_4px_rgba(168,85,247,0.1)]' 
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
                <div className="rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-50/50 p-3 flex flex-col md:flex-row items-center justify-between gap-3 border border-blue-100">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="font-medium text-sm text-muted-foreground">Total Credits</div>
                    <div className="text-lg font-bold text-foreground">
                      {selectedPackage.amount.toLocaleString()} 
                      <span className="text-green-600 font-semibold ml-1">+ {selectedPackage.bonus.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-blue-200 hidden md:block" />
                  <div className="flex flex-col items-center md:items-end">
                    <div className="font-medium text-sm text-muted-foreground">Total Price</div>
                    <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
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
                  <span className="ml-2 text-green-700 font-semibold">100% Secure</span>
                </div>
                {error && <div className="text-red-500 text-sm text-center mb-2" role="alert">{error}</div>}
              </div>
              {/* Footer */}
              <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-base font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={handlePurchase}
                  disabled={isLoading}
                  aria-label="Buy Credits (No Subscription Required)"
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">Processing...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Buy Credits Now
                      <ShieldCheck className="ml-2 h-5 w-5 text-white" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
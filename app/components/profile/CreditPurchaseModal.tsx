import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, CreditCard, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CREDIT_PACKAGES = [
  { amount: 1000, bonus: 0, price: 10, description: 'Perfect for trying out our AI models', popular: false },
  { amount: 5000, bonus: 500, price: 45, description: 'Most popular choice for regular users', popular: true },
  { amount: 10000, bonus: 1500, price: 85, description: 'Great value for power users', popular: false },
  { amount: 25000, bonus: 5000, price: 200, description: 'Best value for heavy usage', popular: false },
];

interface CreditPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance?: number; // Optional, for showing user's current credits
}

export function CreditPurchaseModal({ open, onOpenChange, currentBalance = 1200 }: CreditPurchaseModalProps) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError('');
    // Simulate payment processing
    setTimeout(() => {
      // Simulate error: setError('Payment failed. Please try again.'); setIsLoading(false); return;
      setIsLoading(false);
      setSuccess(true);
      setStep(3);
    }, 1500);
  };

  const handleClose = () => {
    setStep(1);
    setSuccess(false);
    setError('');
    onOpenChange(false);
  };

  // Keyboard navigation for package selection
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, pkgIdx: number) => {
    if (e.key === 'ArrowDown' && pkgIdx < CREDIT_PACKAGES.length - 1) {
      setSelectedPackage(CREDIT_PACKAGES[pkgIdx + 1]);
    } else if (e.key === 'ArrowUp' && pkgIdx > 0) {
      setSelectedPackage(CREDIT_PACKAGES[pkgIdx - 1]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      setSelectedPackage(CREDIT_PACKAGES[pkgIdx]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Purchase Credits</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {step === 1 && 'Step 1 of 2: Choose your credit package'}
            {step === 2 && 'Step 2 of 2: Confirm & Pay'}
            {step === 3 && 'Success!'}
          </div>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="p-6 pt-0"
              aria-label="Choose credit package"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Your Balance:</span>
                <span className="font-semibold text-base text-blue-700 dark:text-blue-300">{currentBalance.toLocaleString()} credits</span>
              </div>
              <div className="grid gap-3" role="radiogroup" aria-label="Credit packages">
                {CREDIT_PACKAGES.map((pkg, idx) => (
                  <motion.button
                    key={pkg.amount}
                    className={`relative flex items-center justify-between w-full rounded-lg border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      selectedPackage.amount === pkg.amount
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-[1.02]' : 'hover:bg-muted/50 border-gray-200'
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                    aria-pressed={selectedPackage.amount === pkg.amount}
                    aria-checked={selectedPackage.amount === pkg.amount}
                    tabIndex={0}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    role="radio"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">
                          {pkg.amount.toLocaleString()} Credits
                        </span>
                        {pkg.bonus > 0 && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            +{pkg.bonus.toLocaleString()} bonus
                          </span>
                        )}
                        {pkg.popular && (
                          <span className="ml-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 px-2 py-0.5 text-xs font-semibold text-white">Popular</span>
                        )}
                        {pkg.popular && selectedPackage.amount === pkg.amount && (
                          <span className="ml-2 rounded-full bg-yellow-400/80 px-2 py-0.5 text-xs font-semibold text-yellow-900">Recommended for you</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${pkg.price.toFixed(2)} <span className="mx-1">•</span> ${(pkg.price / (pkg.amount + pkg.bonus)).toFixed(3)} per credit
                      </div>
                      <div className="text-xs text-muted-foreground">{pkg.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPackage.amount === pkg.amount && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white shadow-lg"
                        >
                          <Check className="h-4 w-4" />
                        </motion.span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
              <DialogFooter className="mt-6 flex justify-end gap-2">
                <Button onClick={handleNext} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 text-base font-semibold shadow-md" disabled={!selectedPackage}>
                  Next
                </Button>
              </DialogFooter>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="p-6 pt-0"
              aria-label="Confirm and pay"
            >
              <div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Total Credits</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPackage.amount.toLocaleString()} + {selectedPackage.bonus.toLocaleString()} bonus
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Total Price</div>
                    <div className="text-sm text-muted-foreground">${selectedPackage.price.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 mb-2">
                <CreditCard className="h-8 w-8 text-blue-600 mb-1" aria-label="Stripe payment" />
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="h-5 w-5 text-green-600" aria-label="100% Secure" />
                  <span className="text-xs font-semibold text-green-700">100% Secure</span>
                  <img src="/stripe-logo.svg" alt="Stripe" className="h-5 ml-2" />
                  <img src="/pci-dss.svg" alt="PCI DSS Compliant" className="h-5 ml-2" />
                </div>
                <span className="text-xs text-muted-foreground mt-1">Credits never expire • No hidden fees</span>
              </div>
              {error && <div className="text-red-500 text-sm text-center mb-2" role="alert">{error}</div>}
              <DialogFooter className="flex justify-between gap-2 mt-4">
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  Back
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 text-base font-semibold shadow-md"
                  onClick={handlePurchase}
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">Processing...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                    </>
                  ) : (
                    'Purchase Credits'
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
          {step === 3 && success && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
              className="flex flex-col items-center justify-center gap-4 py-10"
              aria-label="Purchase successful"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                className="mb-2"
              >
                <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
              </motion.div>
              <div className="text-2xl font-semibold text-center">Purchase Successful!</div>
              <div className="text-base text-muted-foreground text-center">
                Your credits have been added to your account.<br />Thank you for your purchase!
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">New Balance: {(currentBalance + selectedPackage.amount + selectedPackage.bonus).toLocaleString()} credits</div>
              <Button className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 text-base font-semibold shadow-md" onClick={handleClose}>
                Close
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, CreditCard, Info, ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const CREDIT_PACKAGES = [
  { amount: 1000, price: 10, bonus: 0, popular: false, description: 'Perfect for trying out our AI models' },
  { amount: 5000, price: 45, bonus: 500, popular: true, description: 'Most popular choice for regular users' },
  { amount: 10000, price: 85, bonus: 1500, popular: false, description: 'Great value for power users' },
  { amount: 25000, price: 200, bonus: 5000, popular: false, description: 'Best value for heavy usage' },
];

export function CreditPurchaseSection({ isFreePlan = false }: { isFreePlan?: boolean }) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Sticky logic: show sticky bar when options are out of view
  useEffect(() => {
    const handleScroll = () => {
      if (!optionsRef.current) return;
      const rect = optionsRef.current.getBoundingClientRect();
      // Show sticky if bottom of options is above the bottom of the viewport (with some offset)
      setShowSticky(rect.bottom > 0 && rect.bottom < window.innerHeight - 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <Card className="relative overflow-visible max-w-xl mx-auto shadow-xl rounded-2xl border border-gray-100">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-full bg-blue-50">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Purchase Credits
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-blue-500 transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] p-3">
                  <p className="text-sm">Credits are used to power our AI models. Each model uses a different amount of credits per request.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        <CardDescription className="text-base text-muted-foreground">Buy additional credits to use with our AI models. Choose the best package for your needs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-24 md:pb-6">
        {/* Customer-centric message */}
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-900 px-4 py-3.5 text-sm flex items-center gap-3 mb-2">
          <div className="p-1.5 rounded-full bg-green-100">
            <Sparkles className="h-4 w-4 text-green-500" />
          </div>
          <div>
            Buy credits to create and test prompts as much as you want—use them until you run out. <span className="font-semibold">Credits never expire.</span>
          </div>
        </div>
        {/* Credit Options */}
        <div ref={optionsRef} className={isFreePlan ? "grid grid-cols-1 gap-4 w-full" : "flex flex-col gap-4"}>
          {CREDIT_PACKAGES.map((pkg) => (
            <motion.button
              key={pkg.amount}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative flex items-center justify-between w-full rounded-xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400
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
              <div className="space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
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
                <div className="text-xs text-muted-foreground">{pkg.description}</div>
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
        <div className="rounded-xl bg-gradient-to-r from-blue-50/50 to-blue-50/50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-100">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-medium text-sm text-muted-foreground">Total Credits</div>
            <div className="text-xl font-bold text-foreground">
              {selectedPackage.amount.toLocaleString()} 
              <span className="text-green-600 font-semibold ml-1">+ {selectedPackage.bonus.toLocaleString()}</span>
            </div>
            <div className="text-xs text-muted-foreground">(including bonus)</div>
          </div>
          <div className="w-px h-8 bg-blue-200 hidden md:block" />
          <div className="flex flex-col items-center md:items-end">
            <div className="font-medium text-sm text-muted-foreground">Total Price</div>
            <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              ${selectedPackage.price.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">VAT may apply</div>
          </div>
        </div>
        {/* Trust & Security */}
        <div className="text-center text-xs text-muted-foreground mt-2 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 justify-center">
            <div className="p-1 rounded-full bg-green-50">
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </div>
            <span>Secure payment powered by Stripe</span>
            <img src="/stripe-logo.svg" alt="Stripe" className="h-4 ml-1" />
          </div>
          <span>Credits never expire</span>
        </div>
      </CardContent>
      {/* Sticky Footer CTA */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed md:absolute bottom-0 left-0 right-0 w-full flex justify-center z-50 bg-white/95 backdrop-blur-sm shadow-[0_-2px_16px_-8px_rgba(168,85,247,0.10)] px-4 py-4 md:px-6 md:py-4"
            style={{ 
              borderBottomLeftRadius: '1rem', 
              borderBottomRightRadius: '1rem',
              borderTop: '1px solid rgba(168,85,247,0.1)'
            }}
          >
            <div className="w-full max-w-xl flex flex-col items-center gap-2">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-semibold text-lg">{selectedPackage.amount.toLocaleString()} Credits</span>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  ${selectedPackage.price.toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-700 text-lg font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={handlePurchase}
                disabled={isLoading}
                aria-label="Buy Credits (No Subscription Required)"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Buy Credits Now
                <ShieldCheck className="ml-2 h-5 w-5 text-white" />
              </Button>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                  No subscription required
                </span>
                <span className="text-xs text-muted-foreground">100% Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

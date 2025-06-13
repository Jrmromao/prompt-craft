'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, CreditCard, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

const CREDIT_PACKAGES = [
  { 
    amount: 1000, 
    price: 10, 
    bonus: 0,
    popular: false,
    description: 'Perfect for trying out our AI models'
  },
  { 
    amount: 5000, 
    price: 45, 
    bonus: 500,
    popular: true,
    description: 'Most popular choice for regular users'
  },
  { 
    amount: 10000, 
    price: 85, 
    bonus: 1500,
    popular: false,
    description: 'Great value for power users'
  },
  { 
    amount: 25000, 
    price: 200, 
    bonus: 5000,
    popular: false,
    description: 'Best value for heavy usage'
  },
];

export function CreditPurchaseSection() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to popular choice
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

      if (!response.ok) {
        throw new Error('Failed to initiate purchase');
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Purchase Credits
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Credits are used to power our AI models. Each model uses a different amount of credits per request.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Buy additional credits to use with our AI models</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.amount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                selectedPackage.amount === pkg.amount
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPackage(pkg)}
              role="radio"
              aria-checked={selectedPackage.amount === pkg.amount}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedPackage(pkg);
                }
              }}
            >
              {pkg.popular && (
                <div className="absolute -right-2 -top-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-xs font-medium text-white">
                  Popular
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {pkg.amount.toLocaleString()} Credits
                  </span>
                  {pkg.bonus > 0 && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      +{pkg.bonus.toLocaleString()} bonus
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${pkg.price.toFixed(2)} (${(pkg.price / (pkg.amount + pkg.bonus)).toFixed(3)} per credit)
                </div>
                <div className="text-xs text-muted-foreground">
                  {pkg.description}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`h-4 w-4 rounded-full border-2 ${
                    selectedPackage.amount === pkg.amount 
                      ? 'border-primary bg-primary' 
                      : 'border-muted-foreground/25'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
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

        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="mr-2">Processing...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Purchase Credits
            </>
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>Secure payment powered by Stripe</p>
          <p>Credits never expire</p>
        </div>
      </CardContent>
    </Card>
  );
} 
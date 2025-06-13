'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const CREDIT_PACKAGES = [
  { amount: 1000, price: 10, bonus: 0 },
  { amount: 5000, price: 45, bonus: 500 },
  { amount: 10000, price: 85, bonus: 1500 },
  { amount: 25000, price: 200, bonus: 5000 },
];

export function CreditPurchaseSection() {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[0]);
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
    <Card>
      <CardHeader>
        <CardTitle>Purchase Credits</CardTitle>
        <CardDescription>Buy additional credits to use with our AI models</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.amount}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                selectedPackage.amount === pkg.amount
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <div>
                <div className="font-medium">
                  {pkg.amount.toLocaleString()} Credits
                  {pkg.bonus > 0 && (
                    <span className="ml-2 text-sm text-green-600">
                      +{pkg.bonus.toLocaleString()} bonus
                    </span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  ${pkg.price.toFixed(2)} (${(pkg.price / (pkg.amount + pkg.bonus)).toFixed(3)} per credit)
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`h-4 w-4 rounded-full border ${
                    selectedPackage.amount === pkg.amount ? 'border-primary bg-primary' : ''
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

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

        <Button
          className="w-full"
          onClick={handlePurchase}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Purchase Credits'}
        </Button>
      </CardContent>
    </Card>
  );
} 
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface CreditPackage {
  id: string;
  name: string;
  amount: number;
  price: number;
  stripePriceId: string;
  description?: string;
  isPopular: boolean;
  bonusCredits: number;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditPurchaseModal({ isOpen, onClose }: CreditPurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch credit packages
  const { data: creditPackages, isLoading: isLoadingPackages } = useQuery<CreditPackage[]>({
    queryKey: ['creditPackages'],
    queryFn: async () => {
      const response = await fetch('/api/credits/packages');
      if (!response.ok) {
        throw new Error('Failed to fetch credit packages');
      }
      return response.json();
    },
  });

  const handlePurchase = async (creditPackage: CreditPackage) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: creditPackage.stripePriceId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process purchase',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
          <DialogDescription>
            Choose a credit package that suits your needs. Credits never expire.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isLoadingPackages ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))
          ) : (
            creditPackages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-lg border p-4 ${
                  pkg.isPopular ? 'border-primary' : 'border-border'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {pkg.amount} Credits
                      {pkg.bonusCredits > 0 && (
                        <span className="ml-2 text-sm text-green-500">
                          +{pkg.bonusCredits} bonus
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ${pkg.price.toFixed(2)} (${(pkg.price / pkg.amount).toFixed(2)} per credit)
                    </p>
                    {pkg.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{pkg.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handlePurchase(pkg)}
                    disabled={isLoading}
                    variant={pkg.isPopular ? 'default' : 'outline'}
                  >
                    {isLoading ? 'Processing...' : 'Purchase'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
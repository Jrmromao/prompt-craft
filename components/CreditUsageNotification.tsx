import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useCreditBalance } from '@/hooks/useCreditBalance';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CreditPurchaseModal } from './dialogs/CreditPurchaseModal';

const LOW_CREDIT_THRESHOLD = 10; // Show notification when credits are below this number

export function CreditUsageNotification() {
  const { toast } = useToast();
  const { balance, isLoading } = useCreditBalance();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    if (isLoading || !balance) return;

    const totalCredits = balance.monthlyCredits + balance.purchasedCredits;
    
    if (totalCredits <= LOW_CREDIT_THRESHOLD) {
      toast({
        title: 'Low Credits',
        description: (
          <div className="flex flex-col gap-2">
            <p>You're running low on credits. Purchase more to continue using the service.</p>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowPurchaseModal(true)}
            >
              Purchase Credits
            </Button>
          </div>
        ),
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [balance, isLoading, toast]);

  return (
    <CreditPurchaseModal
      isOpen={showPurchaseModal}
      onClose={() => setShowPurchaseModal(false)}
    />
  );
} 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CreditCard, Sparkles, Plus } from 'lucide-react';

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits: number;
  requiredCredits: number;
  missingCredits: number;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  currentCredits,
  requiredCredits,
  missingCredits,
}: InsufficientCreditsDialogProps) {
  const router = useRouter();

  const handlePurchase = () => {
    router.push('/pricing');
    onOpenChange(false);
  };

  // ⚠️ DEVELOPMENT ONLY: This function should be removed before going to production
  // This is a temporary solution for development and testing purposes only
  const handleAddCreditsDev = async () => {
    try {
      const response = await fetch('/api/credits/add-dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // Always add 100 credits in dev mode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add credits');
      }

      // Refresh the page to update credit balance
      window.location.reload();
    } catch (error) {
      console.error('Error adding credits:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Insufficient Credits
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            You need more credits to generate this content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Current Credits:</span>
              <span className="font-medium text-gray-900 dark:text-white">{currentCredits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Required Credits:</span>
              <span className="font-medium text-gray-900 dark:text-white">{requiredCredits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Missing Credits:</span>
              <span className="font-medium text-red-500">{missingCredits}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handlePurchase}
              className="flex w-full items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700"
            >
              <CreditCard className="h-5 w-5" />
              Purchase Credits
            </Button>

            {/* ⚠️ DEVELOPMENT ONLY: This button should be removed before going to production */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={handleAddCreditsDev}
                variant="outline"
                className="flex w-full items-center justify-center gap-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-800 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              >
                <Plus className="h-5 w-5" />
                [DEV] Add 100 Credits
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

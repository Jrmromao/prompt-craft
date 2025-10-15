import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  requiredCredits: number;
}

export function InsufficientCreditsDialog({
  isOpen,
  onClose,
  currentCredits,
  requiredCredits
}: InsufficientCreditsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Insufficient Credits
          </DialogTitle>
          <DialogDescription>
            You need {requiredCredits} credit{requiredCredits !== 1 ? 's' : ''} to test this prompt.
            You currently have {currentCredits} credit{currentCredits !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            You can purchase additional credits or upgrade your plan to get more monthly credits.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-700">
              <Link href="/pricing">
                View Plans
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
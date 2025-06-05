import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VersionDiff } from './VersionDiff';

interface VersionComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  comparison: {
    version1: {
      version: string;
      content: string;
      createdAt: string;
      user: {
        name: string | null;
        imageUrl: string | null;
      };
    };
    version2: {
      version: string;
      content: string;
      createdAt: string;
      user: {
        name: string | null;
        imageUrl: string | null;
      };
    };
    diff: Array<{
      value: string;
      added?: boolean;
      removed?: boolean;
    }>;
  } | null;
}

export function VersionComparisonDialog({
  isOpen,
  onClose,
  comparison,
}: VersionComparisonDialogProps) {
  if (!comparison) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Version Comparison</DialogTitle>
        </DialogHeader>
        <VersionDiff
          version1={comparison.version1}
          version2={comparison.version2}
          diff={comparison.diff}
        />
      </DialogContent>
    </Dialog>
  );
} 
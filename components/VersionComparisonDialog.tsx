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
    version1: any;
    version2: any;
    contentDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
    descriptionDiff: Array<{ value: string; added?: boolean; removed?: boolean }>;
    tagsDiff: { added: string[]; removed: string[] };
    metadataDiff: Array<{ key: string; oldVal: any; newVal: any }>;
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
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-2xl font-bold">Version Comparison</DialogTitle>
        </DialogHeader>
        <VersionDiff
          version1={comparison.version1}
          version2={comparison.version2}
          contentDiff={comparison.contentDiff}
          descriptionDiff={comparison.descriptionDiff}
          tagsDiff={comparison.tagsDiff}
          metadataDiff={comparison.metadataDiff}
        />
      </DialogContent>
    </Dialog>
  );
} 
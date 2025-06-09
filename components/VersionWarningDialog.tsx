import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VersionWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCompare: () => void;
  onCreate?: () => void;
}

export function VersionWarningDialog({
  isOpen,
  onClose,
  onCompare,
  onCreate,
}: VersionWarningDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-[500px] p-6">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-xl font-semibold text-purple-900 dark:text-purple-100">
            Versions Selected
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300">
            {onCreate 
              ? "You have versions selected for comparison. Would you like to continue comparing versions or create a new version?"
              : "You are currently creating a new version. Would you like to continue with version creation or switch to comparing versions?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel 
            onClick={onClose} 
            className="w-full sm:w-auto order-2 sm:order-1 mt-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onCompare} 
            className="w-full sm:w-auto order-1 sm:order-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            {onCreate ? "Continue Comparing" : "Switch to Comparing"}
          </AlertDialogAction>
          {onCreate && (
            <AlertDialogAction 
              onClick={onCreate} 
              className="w-full sm:w-auto order-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Create New Version
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
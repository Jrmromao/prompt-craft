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
  action: 'create' | 'select' | 'clear';
}

export function VersionWarningDialog({
  isOpen,
  onClose,
  onCompare,
  onCreate,
  action,
}: VersionWarningDialogProps) {
  const getDialogContent = () => {
    switch (action) {
      case 'create':
        return {
          title: "Create New Version",
          description: "You have versions selected for comparison. Would you like to continue comparing versions or create a new version?",
          primaryAction: "Create New Version",
          secondaryAction: "Continue Comparing"
        };
      case 'select':
        return {
          title: "Select Version",
          description: "You are currently creating a new version. Would you like to continue with version creation or switch to comparing versions?",
          primaryAction: "Switch to Comparing",
          secondaryAction: "Continue Creating"
        };
      case 'clear':
        return {
          title: "Clear Selection",
          description: "You have two versions selected. Would you like to clear your selection?",
          primaryAction: "Clear Selection",
          secondaryAction: "Keep Selection"
        };
      default:
        return {
          title: "Warning",
          description: "Please choose an action to continue.",
          primaryAction: "Continue",
          secondaryAction: "Cancel"
        };
    }
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-[500px] p-6">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <AlertDialogCancel 
            onClick={onClose} 
            className="w-full sm:w-auto order-2 sm:order-1 mt-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {content.secondaryAction}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={action === 'create' ? onCreate : onCompare} 
            className="w-full sm:w-auto order-1 sm:order-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {content.primaryAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { DataSubjectRightsService } from '@/services/data-subject-rights';
import { DataRetentionService } from '@/services/data-retention';

interface DataRightsPanelProps {
  userId: string;
}

export const DataRightsPanel: React.FC<DataRightsPanelProps> = ({ userId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();
  const dataSubjectRightsService = new DataSubjectRightsService();
  const dataRetentionService = new DataRetentionService();

  const handleDataExport = async () => {
    try {
      setIsLoading(true);
      const data = await dataSubjectRightsService.exportUserData(userId);
      
      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${userId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Data Export Successful',
        description: 'Your data has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setIsLoading(true);
      await dataSubjectRightsService.deleteUserData(userId);
      
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been deleted.',
      });
      
      // Redirect to home page or show appropriate message
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Deletion Failed',
        description: 'There was an error deleting your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
    }
  };

  const handleDataRectification = async () => {
    // This would typically open a modal or navigate to a settings page
    window.location.href = '/settings/profile';
  };

  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Your Data Rights</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Download Your Data</h3>
          <p className="text-gray-600 mb-4">
            Get a copy of all your personal data in a structured, commonly used format.
          </p>
          <Button
            onClick={handleDataExport}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Exporting...' : 'Download My Data'}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Update Your Data</h3>
          <p className="text-gray-600 mb-4">
            Correct or update your personal information.
          </p>
          <Button
            onClick={handleDataRectification}
            disabled={isLoading}
            variant="outline"
          >
            Update My Data
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Delete Your Account</h3>
          <p className="text-gray-600 mb-4">
            Permanently delete your account and all associated data.
          </p>
          {showConfirmation ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </AlertDescription>
              </Alert>
              <div className="space-x-4">
                <Button
                  onClick={handleDataDeletion}
                  disabled={isLoading}
                  variant="destructive"
                >
                  {isLoading ? 'Deleting...' : 'Confirm Deletion'}
                </Button>
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleDataDeletion}
              disabled={isLoading}
              variant="outline"
            >
              Delete My Account
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}; 
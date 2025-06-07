import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash2, UserX, UserCheck, Ban } from 'lucide-react';
import { Role, UserStatus } from '@prisma/client';
import { updateUserRole, updateUserStatus } from '../actions';
import { toast } from 'sonner';

interface UserActionsProps {
  userId: string;
  currentRole: Role;
  currentStatus: UserStatus;
  onEdit: () => void;
}

export function UserActions({ userId, currentRole, currentStatus, onEdit }: UserActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleStatusChange = async (newStatus: UserStatus) => {
    try {
      await updateUserStatus(userId, newStatus === 'ACTIVE');
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {currentStatus === 'ACTIVE' ? (
            <>
              <DropdownMenuItem onClick={() => setShowSuspendDialog(true)}>
                <UserX className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowBanDialog(true)}>
                <Ban className="mr-2 h-4 w-4" />
                Ban User
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={() => setShowActivateDialog(true)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Activate User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove
              their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // TODO: Implement delete user
                toast.error('Delete user functionality not implemented yet');
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent the user from accessing their account. They will not be able to log
              in until you reactivate their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleStatusChange('SUSPENDED');
                setShowSuspendDialog(false);
              }}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently ban the user from the platform. They will not be able to create
              a new account or access any features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleStatusChange('BANNED');
                setShowBanDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate User</AlertDialogTitle>
            <AlertDialogDescription>
              This will reactivate the user's account. They will be able to access all features
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleStatusChange('ACTIVE');
                setShowActivateDialog(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Role } from '@prisma/client';
import { UserActions } from './UserActions';
import { EditUserDialog } from './EditUserDialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { UserData } from '../actions';

interface UsersTableProps {
  initialUsers: UserData[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleEditUser = async (data: { name: string; role: Role }) => {
    try {
      // TODO: Implement update user
      toast.error('Update user functionality not implemented yet');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <Button className="ml-4">Add User</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.planType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.status === 'ACTIVE'
                        ? 'default'
                        : user.status === 'SUSPENDED'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.joinedAt}</TableCell>
                <TableCell>
                  <UserActions
                    userId={user.id}
                    currentRole={user.role}
                    currentStatus={user.status}
                    onEdit={() => {
                      setSelectedUser(user);
                      setShowEditDialog(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={handleEditUser}
        />
      )}
    </>
  );
}

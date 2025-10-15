'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/useRole';
import { Role } from '@/utils/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  role: Role;
}

interface RoleChange {
  id: string;
  userId: string;
  oldRole: Role;
  newRole: Role;
  changedBy: string;
  timestamp: string;
}

export default function RoleManagementPage() {
  const { role, hasRole, isLoaded } = useRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roleChanges, setRoleChanges] = useState<RoleChange[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.USER);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchUsers();
    fetchRoleChanges();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoleChanges = async () => {
    try {
      const response = await fetch('/api/admin/roles/history');
      if (!response.ok) throw new Error('Failed to fetch role changes');
      const data = await response.json();
      setRoleChanges(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch role changes',
        variant: 'destructive',
      });
    }
  };

  // Only allow SUPER_ADMIN to access this page
  if (!hasRole(Role.SUPER_ADMIN)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleChange = async () => {
    try {
      const response = await fetch('/api/admin/roles/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
        }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      toast({
        title: 'Role Updated',
        description: `Successfully updated user role to ${selectedRole}`,
      });

      // Refresh data
      await Promise.all([fetchUsers(), fetchRoleChanges()]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label>Select User</label>
              <Select onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label>Select Role</label>
              <Select onValueChange={(value) => setSelectedRole(value as unknown as Role)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role.toString()}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={handleRoleChange}
            disabled={!selectedUser || !selectedRole}
          >
            Update Role
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Change History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Old Role</TableHead>
                <TableHead>New Role</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleChanges.map((change) => (
                <TableRow key={change.id}>
                  <TableCell>
                    {users.find(u => u.id === change.userId)?.email || change.userId}
                  </TableCell>
                  <TableCell>{change.oldRole}</TableCell>
                  <TableCell>{change.newRole}</TableCell>
                  <TableCell>
                    {users.find(u => u.id === change.changedBy)?.email || change.changedBy}
                  </TableCell>
                  <TableCell>{new Date(change.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 
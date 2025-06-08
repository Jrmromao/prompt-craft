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
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Users, UserPlus } from 'lucide-react';
import { Role } from '@prisma/client';
import { UserActions } from './UserActions';
import { EditUserDialog } from './EditUserDialog';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { UserData, updateUser } from '../actions';
import { Input } from '@/components/ui/input';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from '@tanstack/react-table';

interface UsersTableProps {
  initialUsers: UserData[];
}

export function UsersTable({ initialUsers }: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const getRoleColor = (role: Role) => {
    const colors: Record<Role, { bg: string; text: string }> = {
      ADMIN: {
        bg: 'bg-purple-50 dark:bg-purple-950',
        text: 'text-purple-700 dark:text-purple-300',
      },
      USER: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      },
    };
    return colors[role];
  };

  const getPlanColor = (plan: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      FREE: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      },
      PRO: {
        bg: 'bg-indigo-50 dark:bg-indigo-950',
        text: 'text-indigo-700 dark:text-indigo-300',
      },
      ENTERPRISE: {
        bg: 'bg-emerald-50 dark:bg-emerald-950',
        text: 'text-emerald-700 dark:text-emerald-300',
      },
    };
    return colors[plan] || colors.FREE;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      ACTIVE: {
        bg: 'bg-green-50 dark:bg-green-950',
        text: 'text-green-700 dark:text-green-300',
      },
      SUSPENDED: {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        text: 'text-yellow-700 dark:text-yellow-300',
      },
      BANNED: {
        bg: 'bg-red-50 dark:bg-red-950',
        text: 'text-red-700 dark:text-red-300',
      },
    };
    return colors[status] || colors.ACTIVE;
  };

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Name
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue('name') || 'N/A'}</div>,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Role
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue('role') as Role;
        const { bg, text } = getRoleColor(role);
        return <Badge className={`${bg} ${text} border-0`}>{role}</Badge>;
      },
    },
    {
      accessorKey: 'planType',
      header: 'Plan',
      cell: ({ row }) => {
        const plan = row.getValue('planType') as string;
        const { bg, text } = getPlanColor(plan);
        return <Badge className={`${bg} ${text} border-0`}>{plan}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Status
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const { bg, text } = getStatusColor(status);
        return <Badge className={`${bg} ${text} border-0`}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Joined
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <UserActions
            userId={user.id}
            currentRole={user.role}
            currentStatus={user.status}
            onEdit={() => {
              setSelectedUser(user);
              setShowEditDialog(true);
            }}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: initialUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleEditUser = async (data: { name: string; role: Role }) => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, data);
      toast.success('User updated successfully');
      setShowEditDialog(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={String(table.getColumn('name')?.getFilterValue() ?? '')}
            onChange={e => table.getColumn('name')?.setFilterValue(e.target.value)}
            className="bg-gray-50 pl-8 dark:bg-gray-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Users className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="relative">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-50/50 hover:bg-gray-50/50 dark:bg-gray-900/50 dark:hover:bg-gray-900/50"
              >
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-gray-700 dark:text-gray-300"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-96 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                      <Users className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {table.getColumn('name')?.getFilterValue()
                        ? 'No users match your search'
                        : 'No users found'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {table.getColumn('name')?.getFilterValue()
                        ? "Try adjusting your search or filter to find what you're looking for"
                        : 'Get started by creating a new user'}
                    </p>
                    {table.getColumn('name')?.getFilterValue() ? (
                      <Button
                        variant="outline"
                        onClick={() => table.getColumn('name')?.setFilterValue('')}
                        className="mt-2"
                      >
                        Clear Search
                      </Button>
                    ) : (
                      <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New User
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
        <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
          {table.getFilteredRowModel().rows.length} user(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
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

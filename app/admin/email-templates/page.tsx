'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { CreateTemplateDialog } from '@/components/dialogs/CreateTemplateDialog';
import { DeleteConfirmationDialog } from '@/components/dialogs/DeleteConfirmationDialog';
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  FileText,
  Clock,
  Shield,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const { toast } = useToast();

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      welcome: {
        bg: 'bg-blue-50 dark:bg-blue-950',
        text: 'text-blue-700 dark:text-blue-300',
      },
      notification: {
        bg: 'bg-purple-50 dark:bg-purple-950',
        text: 'text-purple-700 dark:text-purple-300',
      },
      alert: {
        bg: 'bg-red-50 dark:bg-red-950',
        text: 'text-red-700 dark:text-red-300',
      },
      reminder: {
        bg: 'bg-yellow-50 dark:bg-yellow-950',
        text: 'text-yellow-700 dark:text-yellow-300',
      },
      confirmation: {
        bg: 'bg-green-50 dark:bg-green-950',
        text: 'text-green-700 dark:text-green-300',
      },
      custom: {
        bg: 'bg-gray-50 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
      },
    };
    return colors[type] || colors.custom;
  };

  const columns: ColumnDef<EmailTemplate>[] = [
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
    },
    {
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('subject')}</div>,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Type
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        const { bg, text } = getTypeColor(type);
        return <Badge className={`${bg} ${text} border-0`}>{type}</Badge>;
      },
    },
    {
      accessorKey: 'variables',
      header: 'Variables',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue('variables') as string[]).map((variable: string) => (
            <Badge key={variable} variant="outline" className="bg-gray-50 dark:bg-gray-800">
              {variable}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge
            className={`${
              isActive
                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            } border-0`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="flex items-center gap-1"
          >
            Last Updated
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => format(new Date(row.getValue('updatedAt') as string), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <CreateTemplateDialog
                  mode="edit"
                  template={template}
                  onTemplateCreated={fetchTemplates}
                  trigger={
                    <div className="flex items-center">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Template
                    </div>
                  }
                />
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(template)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: templates,
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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/email-templates/${templateToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const openDeleteDialog = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const stats = {
    total: templates.length,
    active: templates.filter(t => t.isActive).length,
    types: Object.keys(
      templates.reduce(
        (acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).length,
    newThisWeek: templates.filter(t => {
      const created = new Date(t.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Email Templates
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage and customize email templates for your platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Shield className="mr-2 h-4 w-4" />
            Admin Access
          </Badge>
          <CreateTemplateDialog
            onTemplateCreated={fetchTemplates}
            trigger={
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <FileText className="mr-2 h-4 w-4" />
                Add New Template
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Templates
            </CardTitle>
            <Mail className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300">All email templates</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Active Templates
            </CardTitle>
            <FileText className="h-5 w-5 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.active}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">Currently active templates</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              New This Week
            </CardTitle>
            <Clock className="h-5 w-5 text-purple-700 dark:text-purple-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.newThisWeek}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Templates created in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Template Types
            </CardTitle>
            <FileText className="h-5 w-5 text-red-700 dark:text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.types}</div>
            <p className="text-xs text-red-700 dark:text-red-300">Different template categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Table */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5 text-gray-500" />
              Template Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Updated: {new Date().toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={event => table.getColumn('name')?.setFilterValue(event.target.value)}
                className="h-8 w-[200px] lg:w-[300px]"
              />
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <p className="text-sm text-muted-foreground">No templates found</p>
                          <CreateTemplateDialog
                            onTemplateCreated={fetchTemplates}
                            trigger={
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                              >
                                Create Template
                              </Button>
                            }
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
              {table.getFilteredRowModel().rows.length} template(s) total
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
      />
    </div>
  );
}

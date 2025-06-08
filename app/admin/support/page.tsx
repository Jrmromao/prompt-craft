'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Shield,
  Calendar,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { getTickets } from './actions';
import { TicketStatus, Category, Priority } from '@prisma/client';
import { ViewTicketDialog } from './components/ViewTicketDialog';

interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: Priority;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      imageUrl: string | null;
    };
  }>;
  user: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  };
}

interface ColorScheme {
  bg: string;
  text: string;
}

type FilterValue<T> = T | 'ALL';

const statusColors: Record<TicketStatus, ColorScheme> = {
  OPEN: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  IN_PROGRESS: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  RESOLVED: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
  },
  CLOSED: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
  },
};

const priorityColors: Record<Priority, ColorScheme> = {
  LOW: {
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    text: 'text-gray-700 dark:text-gray-300',
  },
  MEDIUM: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  HIGH: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-300',
  },
  URGENT: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
  },
};

const categoryColors: Record<Category, ColorScheme> = {
  BUG: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
  },
  FEATURE_REQUEST: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-300',
  },
  GENERAL_INQUIRY: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  TECHNICAL_SUPPORT: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-300',
  },
  BILLING: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
};

export default function SupportTicketsPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [statusFilter, setStatusFilter] = useState<FilterValue<TicketStatus>>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<FilterValue<Priority>>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FilterValue<Category>>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      };
      const data = await getTickets(filters);
      // Convert date strings to Date objects
      const ticketsWithDates = data.map((ticket: any) => ({
        ...ticket,
        createdAt: new Date(ticket.createdAt),
        updatedAt: new Date(ticket.updatedAt),
        messages: ticket.messages.map((message: any) => ({
          ...message,
          createdAt: new Date(message.createdAt),
        })),
      }));
      setTickets(ticketsWithDates);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTickets();
    }
  }, [userId, statusFilter, priorityFilter, categoryFilter]);

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('title')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as TicketStatus;
        return (
          <Badge
            variant="outline"
            className={`${statusColors[status].bg} ${statusColors[status].text}`}
          >
            {status.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as Priority;
        return (
          <Badge
            variant="outline"
            className={`${priorityColors[priority].bg} ${priorityColors[priority].text}`}
          >
            {priority}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as Category;
        return (
          <Badge
            variant="outline"
            className={`${categoryColors[category].bg} ${categoryColors[category].text}`}
          >
            {category.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'messages',
      header: 'Messages',
      cell: ({ row }) => {
        const messages = row.getValue('messages') as Ticket['messages'];
        return (
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span>{messages.length}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ticket = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={e => {
              e.stopPropagation();
              router.push(`/admin/support/${ticket.id}`);
            }}
          >
            View
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    urgent: tickets.filter(t => t.priority === 'URGENT').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Support Tickets
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Manage and respond to user support requests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <Shield className="mr-2 h-4 w-4" />
            Admin Access
          </Badge>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Tickets
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-700 dark:text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300">All support tickets</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Open Tickets
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {stats.open}
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Tickets awaiting response
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Urgent Tickets
            </CardTitle>
            <Clock className="h-5 w-5 text-red-700 dark:text-red-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.urgent}</div>
            <p className="text-xs text-red-700 dark:text-red-300">High priority tickets</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Resolved Tickets
            </CardTitle>
            <FileText className="h-5 w-5 text-green-700 dark:text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.resolved}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">Successfully resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              Ticket Directory
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
                placeholder="Search tickets..."
                value={globalFilter ?? ''}
                onChange={event => setGlobalFilter(event.target.value)}
                className="h-8 w-[200px] lg:w-[300px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={value => setStatusFilter(value as FilterValue<TicketStatus>)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={priorityFilter}
                onValueChange={value => setPriorityFilter(value as FilterValue<Priority>)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={categoryFilter}
                onValueChange={value => setCategoryFilter(value as FilterValue<Category>)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                  <SelectItem value="GENERAL_INQUIRY">General Inquiry</SelectItem>
                  <SelectItem value="TECHNICAL_SUPPORT">Technical Support</SelectItem>
                  <SelectItem value="BILLING">Billing</SelectItem>
                </SelectContent>
              </Select>
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
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        router.push(`/admin/support/${row.original.id}`);
                      }}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/admin/support/${row.original.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
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
                          <p className="text-sm text-muted-foreground">No tickets found</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 bg-indigo-600 hover:bg-indigo-700"
                          >
                            Create Ticket
                          </Button>
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
              {table.getFilteredRowModel().rows.length} ticket(s) total
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

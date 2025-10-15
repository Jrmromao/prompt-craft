'use client';
import React, { useEffect, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import TableSkeleton from '@/components/table/TableSkeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Safe window access after component is mounted
  useEffect(() => {
    // Set initial mobile state
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-900/30 md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="h-11 border-b border-gray-200 bg-gray-50 px-6 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300"
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-900">
            {hasRows ? (
              rows.map(row => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 transition-colors last:border-none hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {hasRows ? (
          rows.map(row => (
            <Card
              key={row.id}
              className="border-blue-100 bg-white p-4 shadow-sm dark:border-blue-900/30 dark:bg-gray-900"
            >
              <div className="space-y-3">
                {row.getVisibleCells().map((cell, index) => {
                  const headerValue = cell.column.columnDef.header;
                  const header =
                    typeof headerValue === 'function' ? cell.column.id : (headerValue as string);

                  // First cell gets special treatment (usually the name/title)
                  if (index === 0) {
                    return (
                      <div
                        key={cell.id}
                        className="mb-2 border-b border-blue-100 pb-2 dark:border-blue-900/20"
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={cell.id} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {header}
                      </span>
                      <span className="text-right text-sm text-gray-700 dark:text-gray-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-lg border border-blue-100 bg-white py-8 text-center text-sm text-gray-500 dark:border-blue-900/30 dark:bg-gray-900 dark:text-gray-400">
            No results.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col justify-between gap-4 px-2 py-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-4 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={pageSize.toString()}
              onValueChange={value => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-16 border-gray-200 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            Page {pageIndex + 1} of {table.getPageCount() || 1}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-gray-200 text-gray-600 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/20"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-gray-200 text-gray-600 hover:bg-blue-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/20"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

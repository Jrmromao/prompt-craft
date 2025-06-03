import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

const PAGE_SIZE_OPTIONS = [5, 10, 20];

interface TableWithPaginationProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: string;
  renderDialog?: (row: T | null, setRow: (row: T | null) => void) => React.ReactNode;
}

export function TableWithPagination<T>({ columns, data, title, renderDialog }: TableWithPaginationProps<T>) {
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  // Update page size and reset to first page
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  const totalPages = table.getPageCount();
  const totalResults = data.length;

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <div className="rounded-xl border bg-white dark:bg-[#18122B] shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-[#201a36]">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-400">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  className={
                    `transition-colors ${idx % 2 === 0 ? 'bg-white dark:bg-[#18122B]' : 'bg-gray-50 dark:bg-[#221c3a]'} hover:bg-purple-50 dark:hover:bg-purple-900/30`
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Rows per page:</span>
          <select
            className="border rounded px-2 py-1 bg-transparent dark:bg-[#18122B]"
            value={pageSize}
            onChange={handlePageSizeChange}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="ml-4">
            Page <b>{pageIndex + 1}</b> of <b>{totalPages}</b>
          </span>
          <span className="ml-4">Total: <b>{totalResults}</b></span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(prev => Math.max(prev - 1, 0))}
            disabled={pageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(prev => Math.min(prev + 1, totalPages - 1))}
            disabled={pageIndex >= totalPages - 1}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            Last
          </Button>
        </div>
      </div>
      {renderDialog && renderDialog(selectedRow, setSelectedRow)}
    </div>
  );
} 
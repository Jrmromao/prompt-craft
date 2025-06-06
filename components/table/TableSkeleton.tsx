import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TableSkeleton = ({ columns = 4, rows = 5 }) => {
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {[...Array(columns)].map((_, i) => (
                <TableHead
                  key={`header-${i}`}
                  className="h-11 border-b border-slate-200 bg-slate-100 px-6 text-xs font-medium text-slate-600"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow
                key={`row-${rowIndex}`}
                className="border-b border-slate-100 last:border-none hover:bg-slate-50/80"
              >
                {[...Array(columns)].map((_, colIndex) => (
                  <TableCell
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="px-6 py-3 text-sm text-slate-700"
                  >
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;

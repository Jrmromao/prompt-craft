import { Prompt } from "@/types/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RecentPromptsTableProps {
  prompts: Prompt[];
}

export function RecentPromptsTable({ prompts }: RecentPromptsTableProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const columns: ColumnDef<Prompt>[] = [
    {
      accessorKey: "input",
      header: "Input",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.original.input}
        </div>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "creditsUsed",
      header: "Credits",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => setSelectedPrompt(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: prompts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Prompts</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
          </DialogHeader>
          {selectedPrompt && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Input:</h3>
                <p className="whitespace-pre-wrap">{selectedPrompt.input}</p>
              </div>
              <div>
                <h3 className="font-semibold">Output:</h3>
                <p className="whitespace-pre-wrap">{selectedPrompt.output}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 
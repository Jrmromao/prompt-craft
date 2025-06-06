"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModeratedWord {
  id: string;
  contentId: string;
  severity: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModeratedWordsTableProps {
  data: ModeratedWord[];
  onRemoveWord: (id: string) => Promise<void>;
}

export function ModeratedWordsTable({ data, onRemoveWord }: ModeratedWordsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleRemoveClick = (id: string, word: string) => {
    setSelectedWordId(id);
    setSelectedWord(word);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (selectedWordId) {
      await onRemoveWord(selectedWordId);
      setConfirmDialogOpen(false);
      setSelectedWordId(null);
      setSelectedWord(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  };

  const columns: ColumnDef<ModeratedWord>[] = [
    {
      accessorKey: "contentId",
      header: "Word",
    },
    {
      accessorKey: "severity",
      header: "Severity",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return formatDate(row.original.createdAt);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRemoveClick(row.original.id, row.original.contentId)}
          >
            Remove
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No moderated words found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Word</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to remove the word <span className="font-semibold">{selectedWord}</span>?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
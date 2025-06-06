import { TableWithPagination } from '@/components/table/TableWithPagination';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { format } from 'date-fns';

// PromptGeneration type for dashboard recent prompts
interface PromptGeneration {
  id: string;
  input: string;
  output: string;
  model: string;
  creditsUsed: number;
  createdAt: string;
}

interface RecentPromptsTableProps {
  prompts: PromptGeneration[];
}

export function RecentPromptsTable({ prompts }: RecentPromptsTableProps) {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptGeneration | null>(null);

  const columns = [
    {
      accessorKey: 'input',
      header: 'Input',
      cell: ({ row }: any) => (
        <div className="max-w-[220px] truncate" title={row.original.input}>
          {row.original.input}
        </div>
      ),
    },
    {
      accessorKey: 'model',
      header: 'Model',
      cell: ({ row }: any) => (
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {row.original.model}
        </span>
      ),
    },
    {
      accessorKey: 'creditsUsed',
      header: 'Credits',
      cell: ({ row }: any) => (
        <span className="font-semibold text-purple-700 dark:text-purple-300">
          {row.original.creditsUsed}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => <div>{format(new Date(row.original.createdAt), 'yyyy-MM-dd')}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <Button variant="ghost" onClick={() => setSelectedPrompt(row.original)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <TableWithPagination
      columns={columns}
      data={prompts}
      title="Recent Prompts"
      renderDialog={(row, setRow) => (
        <Dialog open={!!row} onOpenChange={() => setRow(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Prompt Details</DialogTitle>
            </DialogHeader>
            {row && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Input:</h3>
                  <p className="whitespace-pre-wrap" title={row.input}>
                    {row.input}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Output:</h3>
                  <p className="whitespace-pre-wrap" title={row.output}>
                    {row.output}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    />
  );
}

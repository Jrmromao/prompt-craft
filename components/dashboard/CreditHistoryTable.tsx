import { useEffect, useState } from 'react';
import { TableWithPagination } from '@/components/table/TableWithPagination';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const creditTypeColors: { [key: string]: string } = {
  PURCHASE: 'bg-green-100 text-green-800',
  MONTHLY_RENEWAL: 'bg-blue-100 text-blue-800',
  USAGE: 'bg-red-100 text-red-800',
  BONUS: 'bg-blue-100 text-blue-800',
  REFUND: 'bg-yellow-100 text-yellow-800',
  INITIAL: 'bg-gray-100 text-gray-800',
};

const creditTypeLabels: { [key: string]: string } = {
  PURCHASE: 'Purchase',
  MONTHLY_RENEWAL: 'Monthly Renewal',
  USAGE: 'Usage',
  BONUS: 'Bonus',
  REFUND: 'Refund',
  INITIAL: 'Initial',
};

export function CreditHistoryTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await fetch('/api/credits/history');
        if (!res.ok) throw new Error('Failed to fetch credit history');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const columns = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge
          className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${creditTypeColors[row.original.type as string]}`}
        >
          {creditTypeLabels[row.original.type as string]}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => (
        <span
          className={`block text-right font-mono text-base ${row.original.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {row.original.amount > 0 ? '+' : ''}
          {row.original.amount}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => (
        <span className="text-gray-700 dark:text-gray-200">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => (
        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(row.original.createdAt), 'yyyy-MM-dd')}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading credit history...</div>;
  }

  return <TableWithPagination columns={columns} data={data} title="Credit History" />;
}

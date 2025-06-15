import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { History } from 'lucide-react';

interface CreditUsageRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  model?: string;
}

interface CreditUsageHistoryProps {
  records: CreditUsageRecord[];
  className?: string;
}

export function CreditUsageHistory({ records, className }: CreditUsageHistoryProps) {
  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount.toLocaleString()}`;
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return '';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Credit Usage History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(record.date), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell className="capitalize">{record.type}</TableCell>
                <TableCell>{record.model || '-'}</TableCell>
                <TableCell className={`text-right font-medium ${getAmountColor(record.amount)}`}>
                  {formatAmount(record.amount)}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{record.description}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No usage history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 
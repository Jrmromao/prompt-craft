import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { CreditType } from '@/utils/constants';

interface CreditTransaction {
  id: string;
  amount: number;
  type: CreditType;
  description: string;
  createdAt: Date;
}

interface CreditHistoryProps {
  transactions: CreditTransaction[];
  isLoading?: boolean;
}

export function CreditHistory({ transactions, isLoading }: CreditHistoryProps) {
  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-500' : 'text-red-500';
  };

  const getAmountPrefix = (amount: number) => {
    return amount > 0 ? '+' : '';
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
        <div className="space-y-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Credit History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="capitalize">
                {transaction.type.toLowerCase().replace('_', ' ')}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className={`text-right font-medium ${getAmountColor(transaction.amount)}`}>
                {getAmountPrefix(transaction.amount)}{transaction.amount}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No transactions yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 
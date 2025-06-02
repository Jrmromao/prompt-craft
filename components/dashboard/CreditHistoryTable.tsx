import { CreditHistory, CreditType } from "@/types/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CreditHistoryTableProps {
  history: CreditHistory[];
}

const creditTypeColors: Record<CreditType, string> = {
  PURCHASE: "bg-green-100 text-green-800",
  MONTHLY_RENEWAL: "bg-blue-100 text-blue-800",
  USAGE: "bg-red-100 text-red-800",
  BONUS: "bg-purple-100 text-purple-800",
  REFUND: "bg-yellow-100 text-yellow-800",
};

const creditTypeLabels: Record<CreditType, string> = {
  PURCHASE: "Purchase",
  MONTHLY_RENEWAL: "Monthly Renewal",
  USAGE: "Usage",
  BONUS: "Bonus",
  REFUND: "Refund",
};

export function CreditHistoryTable({ history }: CreditHistoryTableProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Credit History</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Badge className={creditTypeColors[entry.type]}>
                    {creditTypeLabels[entry.type]}
                  </Badge>
                </TableCell>
                <TableCell className={entry.amount > 0 ? "text-green-600" : "text-red-600"}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  {new Date(entry.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 
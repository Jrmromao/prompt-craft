"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: string;
  reason: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface ReportDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reports: Report[];
}

export function ReportDetails({ open, onOpenChange, reports }: ReportDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Report Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {report.user.name || report.user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(report.createdAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{report.reason}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 
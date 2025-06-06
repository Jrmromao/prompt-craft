"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportedContentTable } from "./ReportedContentTable";
import { ColumnDef, Table } from "@tanstack/react-table";
import { ReportedPrompt, ReportedComment } from "../services/moderationService";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef } from "react";
import { ReviewDialog } from "./ReviewDialog";
import { ReportDetails } from "./ReportDetails";
import { moderateContent, bulkModerateContent } from "../services/moderationActions";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModerationTablesProps {
  reportedPrompts: ReportedPrompt[];
  reportedComments: ReportedComment[];
}

interface SelectedContent {
  id: string;
  type: "prompt" | "comment";
  name?: string;
  content: string;
  author: {
    name: string | null;
    email: string;
  };
  reportCount: number;
  lastReportedAt: Date;
}

interface Report {
  id: string;
  reason: string;
  details: string;
  createdAt: Date;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

export function ModerationTables({
  reportedPrompts,
  reportedComments,
}: ModerationTablesProps) {
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [selectedReports, setSelectedReports] = useState<{
    type: "prompt" | "comment";
    reports: Array<{
      id: string;
      reason: string;
      createdAt: Date;
      user: {
        name: string | null;
        email: string;
      };
    }>;
  } | null>(null);

  const [bulkAction, setBulkAction] = useState<{
    type: "prompt" | "comment";
    action: "approve" | "reject" | "delete";
    contentIds: string[];
  } | null>(null);

  const promptsTableRef = useRef<Table<ReportedPrompt>>(null);
  const commentsTableRef = useRef<Table<ReportedComment>>(null);

  const promptColumns: ColumnDef<ReportedPrompt>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Prompt",
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const author = row.original.author;
        return author.name || author.email;
      },
    },
    {
      accessorKey: "reportCount",
      header: "Reports",
    },
    {
      accessorKey: "lastReportedAt",
      header: "Last Report",
      cell: ({ row }) => {
        return formatDistanceToNow(row.original.lastReportedAt, {
          addSuffix: true,
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReports({
                  type: "prompt",
                  reports: row.original.reports,
                });
              }}
            >
              View Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContent({
                  id: row.original.id,
                  type: "prompt",
                  name: row.original.name,
                  content: row.original.name,
                  author: row.original.author,
                  reportCount: row.original.reportCount,
                  lastReportedAt: row.original.lastReportedAt,
                });
              }}
            >
              Review
            </Button>
          </div>
        );
      },
    },
  ];

  const commentColumns: ColumnDef<ReportedComment>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "content",
      header: "Comment",
      cell: ({ row }) => {
        return row.original.content.substring(0, 50) + "...";
      },
    },
    {
      accessorKey: "author",
      header: "Author",
      cell: ({ row }) => {
        const author = row.original.author;
        return author.name || author.email;
      },
    },
    {
      accessorKey: "reportCount",
      header: "Reports",
    },
    {
      accessorKey: "lastReportedAt",
      header: "Last Report",
      cell: ({ row }) => {
        return formatDistanceToNow(row.original.lastReportedAt, {
          addSuffix: true,
        });
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedReports({
                  type: "comment",
                  reports: row.original.reports,
                });
              }}
            >
              View Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedContent({
                  id: row.original.id,
                  type: "comment",
                  content: row.original.content,
                  author: row.original.author,
                  reportCount: row.original.reportCount,
                  lastReportedAt: row.original.lastReportedAt,
                });
              }}
            >
              Review
            </Button>
          </div>
        );
      },
    },
  ];

  const handleModeration = async (
    contentId: string,
    contentType: "prompt" | "comment",
    action: "approve" | "reject" | "delete",
    reason: string
  ) => {
    try {
      await moderateContent({
        contentId,
        contentType,
        action,
        reason,
      });
      toast.success("Content moderated successfully");
      // TODO: Refresh the data
    } catch (error) {
      toast.error("Failed to moderate content");
    }
  };

  const handleBulkModeration = async (
    contentIds: string[],
    contentType: "prompt" | "comment",
    action: "approve" | "reject" | "delete",
    reason: string
  ) => {
    try {
      await bulkModerateContent(contentIds, contentType, action, reason);
      toast.success("Content moderated successfully");
      // TODO: Refresh the data
    } catch (error) {
      toast.error("Failed to moderate content");
    }
  };

  const handleBulkAction = (type: "prompt" | "comment", action: "approve" | "reject" | "delete") => {
    const table = type === "prompt" ? promptsTableRef.current : commentsTableRef.current;
    if (!table) return;

    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error(`No ${type}s selected`);
      return;
    }

    setBulkAction({
      type,
      action,
      contentIds: selectedRows.map((row) => row.original.id),
    });
  };

  return (
    <div className="space-y-8">
      <ReportedContentTable
        data={reportedPrompts}
        columns={promptColumns}
        title="Reported Prompts"
        reportCount={reportedPrompts.length}
        ref={promptsTableRef}
      />

      <ReportedContentTable
        data={reportedComments}
        columns={commentColumns}
        title="Reported Comments"
        reportCount={reportedComments.length}
        ref={commentsTableRef}
      />

      {selectedContent && (
        <ReviewDialog
          open={!!selectedContent}
          onOpenChange={(open) => !open && setSelectedContent(null)}
          content={selectedContent}
          onModerate={handleModeration}
        />
      )}

      {selectedReports && (
        <ReportDetails
          open={!!selectedReports}
          onOpenChange={(open) => !open && setSelectedReports(null)}
          reports={selectedReports.reports}
        />
      )}

      {bulkAction && (
        <AlertDialog
          open={!!bulkAction}
          onOpenChange={(open) => !open && setBulkAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {bulkAction.action} {bulkAction.contentIds.length}{" "}
                {bulkAction.type === "prompt" ? "prompts" : "comments"}? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleBulkModeration(
                    bulkAction.contentIds,
                    bulkAction.type,
                    bulkAction.action,
                    `Bulk ${bulkAction.action} action`
                  );
                  setBulkAction(null);
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
} 
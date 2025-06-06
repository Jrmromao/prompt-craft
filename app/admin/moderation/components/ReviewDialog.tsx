"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: {
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
  };
  onModerate: (
    contentId: string,
    contentType: "prompt" | "comment",
    action: "approve" | "reject" | "delete",
    reason: string
  ) => Promise<void>;
}

export function ReviewDialog({
  open,
  onOpenChange,
  content,
  onModerate,
}: ReviewDialogProps) {
  const [action, setAction] = useState<"approve" | "reject" | "delete">("approve");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onModerate(content.id, content.type, action, reason);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to moderate content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Reported Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Content Type</Label>
            <p className="text-sm text-gray-500">
              {content.type === "prompt" ? "Prompt" : "Comment"}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="rounded-md border p-4 bg-gray-50">
              {content.type === "prompt" ? (
                <div>
                  <h4 className="font-medium">{content.name}</h4>
                  <p className="mt-2 text-sm text-gray-600">{content.content}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">{content.content}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Author</Label>
            <p className="text-sm text-gray-500">
              {content.author.name || content.author.email}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Reports</Label>
            <p className="text-sm text-gray-500">
              {content.reportCount} reports, last reported{" "}
              {new Date(content.lastReportedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex space-x-4">
              <Button
                variant={action === "approve" ? "default" : "outline"}
                onClick={() => setAction("approve")}
              >
                Approve
              </Button>
              <Button
                variant={action === "reject" ? "default" : "outline"}
                onClick={() => setAction("reject")}
              >
                Reject
              </Button>
              <Button
                variant={action === "delete" ? "destructive" : "outline"}
                onClick={() => setAction("delete")}
              >
                Delete
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for your decision..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
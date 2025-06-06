"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SubmitWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (word: string, severity: string, category: string, status: string) => Promise<void>;
}

export function SubmitWordDialog({
  open,
  onOpenChange,
  onSubmit,
}: SubmitWordDialogProps) {
  const [word, setWord] = useState("");
  const [severity, setSeverity] = useState("low");
  const [category, setCategory] = useState("sexual");
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setWord("");
      setSeverity("low");
      setCategory("sexual");
      setStatus("active");
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await onSubmit(word, severity, category, status);
      // Reset state after successful submit
      setWord("");
      setSeverity("low");
      setCategory("sexual");
      setStatus("active");
    } catch (error) {
      toast.error("Failed to submit word");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit New Word for Moderation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Word</Label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter word"
            />
          </div>
          <div className="space-y-2">
            <Label>Severity</Label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="sexual">Sexual</option>
              <option value="attracting">Attracting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
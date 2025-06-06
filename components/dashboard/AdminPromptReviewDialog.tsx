'use client';
import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminPromptReview } from './AdminPromptReview';

export function AdminPromptReviewDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-8 right-8 z-50 bg-purple-600 text-white shadow-lg hover:bg-purple-700">
          Review Prompts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Pending Prompt Review</DialogTitle>
        <AdminPromptReview />
      </DialogContent>
    </Dialog>
  );
}

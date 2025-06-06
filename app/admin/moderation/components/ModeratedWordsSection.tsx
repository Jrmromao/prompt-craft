"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeratedWordsTable } from "@/app/admin/moderation/components/ModeratedWordsTable";
import { SubmitWordDialog } from "@/app/admin/moderation/components/SubmitWordDialog";
import { toast } from "sonner";

interface ModeratedWord {
  id: string;
  contentId: string;
  severity: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ModeratedWordsSectionProps {
  initialWords: ModeratedWord[];
}

export function ModeratedWordsSection({ initialWords }: ModeratedWordsSectionProps) {
  const [words, setWords] = useState<ModeratedWord[]>(initialWords);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const handleSubmitWord = async (word: string, severity: string, category: string, status: string) => {
    try {
      const res = await fetch("/api/moderated-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word, severity, category, status }),
      });
      if (!res.ok) throw new Error("Failed to add word");
      const newWord = await res.json();
      setWords((prev) => [newWord, ...prev]);
      toast.success("Word added successfully");
      setIsSubmitDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add word");
      console.error(error);
    }
  };

  const handleRemoveWord = async (id: string) => {
    try {
      const res = await fetch("/api/moderated-words", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to remove word");
      setWords((prev) => prev.filter((word) => word.id !== id));
      toast.success("Word removed successfully");
    } catch (error) {
      toast.error("Failed to remove word");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Moderated Words</h2>
      <p className="text-sm text-gray-500 mb-4">Review and manage moderated words.</p>
      <Button onClick={() => setIsSubmitDialogOpen(true)}>Submit New Word</Button>
      <div className="mt-4">
        <ModeratedWordsTable 
          data={words} 
          onRemoveWord={handleRemoveWord}
        />
      </div>
      <SubmitWordDialog
        open={isSubmitDialogOpen}
        onOpenChange={setIsSubmitDialogOpen}
        onSubmit={handleSubmitWord}
      />
    </div>
  );
} 
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UpvoteButtonProps {
  promptId: string;
  upvotes: number;
}

export function UpvoteButton({ promptId, upvotes }: UpvoteButtonProps) {
  const [count, setCount] = useState(upvotes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpvote = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/upvote`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to upvote");
      const data = await res.json();
      setCount(data.upvotes);
    } catch (err) {
      setError("Could not upvote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={handleUpvote} disabled={loading} aria-label="Upvote this prompt">
        ⬆️ Upvote ({count})
      </Button>
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
} 
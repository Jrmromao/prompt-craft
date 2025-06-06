"use client";
import { useState, useEffect } from "react";

interface PlaygroundProps {
  initialPrompt?: string;
  disabled?: boolean;
  onResult?: (result: string) => void;
  className?: string;
}

const TIER_LIMITS: Record<string, number | null> = {
  FREE: 20,
  LITE: 300,
  PRO: null, // unlimited
};

export default function Playground({ initialPrompt = "", disabled = false, onResult, className = "" }: PlaygroundProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usage, setUsage] = useState<{ planType: string; playgroundRunsThisMonth: number } | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/user/usage?userId=me");
        if (!res.ok) throw new Error("Failed to fetch usage");
        const data = await res.json();
        setUsage({ planType: data.planType, playgroundRunsThisMonth: data.playgroundRunsThisMonth });
      } catch (e) {
        setUsage(null);
      }
    }
    fetchUsage();
  }, []);

  const limit = usage ? TIER_LIMITS[usage.planType] : null;
  const runsLeft = limit !== null && usage ? Math.max(0, limit - usage.playgroundRunsThisMonth) : null;
  const isOverLimit = !!(limit !== null && usage && usage.playgroundRunsThisMonth >= limit);

  async function runPrompt() {
    if (isOverLimit) {
      setShowUpgrade(true);
      return;
    }
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error("Failed to run prompt");
      const data = await res.json();
      setOutput(data.result || "No output");
      if (onResult) onResult(data.result || "No output");
      // Refetch usage after a run
      if (usage) {
        setUsage(u => u && { ...u, playgroundRunsThisMonth: u.playgroundRunsThisMonth + 1 });
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {usage && (
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>Plan: <b>{usage.planType}</b></span>
          {limit !== null && (
            <span>| Playground runs left this month: <b>{runsLeft}</b> / {limit}</span>
          )}
          {limit === null && <span>| Unlimited Playground runs</span>}
        </div>
      )}
      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={6}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        disabled={disabled || loading || isOverLimit}
      />
      <button
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded disabled:opacity-50"
        onClick={runPrompt}
        disabled={loading || !prompt.trim() || disabled || isOverLimit}
      >
        {isOverLimit ? "Upgrade for more runs" : loading ? "Running..." : "Run Prompt"}
      </button>
      {showUpgrade && (
        <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded text-yellow-800 dark:text-yellow-200">
          <b>You've reached your Playground run limit for this month.</b><br />
          Upgrade your plan for more runs!
        </div>
      )}
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {output && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>AI Output:</strong>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
} 
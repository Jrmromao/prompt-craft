"use client";
import { useState, useEffect } from "react";

interface PlaygroundProps {
  initialPrompt?: string;
  disabled?: boolean;
  onResult?: (result: string) => void;
  className?: string;
}

interface Usage {
  planType: string;
  playgroundRunsThisMonth: number;
}

export default function Playground({ initialPrompt = "", disabled = false, onResult, className = "" }: PlaygroundProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [isOverLimit, setIsOverLimit] = useState(false);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/user/usage");
        if (!res.ok) throw new Error("Failed to fetch usage");
        const data = await res.json();
        setUsage(data);
        // Check if user has exceeded their limit
        const TIER_LIMITS: Record<string, number | null> = {
          FREE: 20,
          LITE: 300,
          PRO: null, // unlimited
        };
        const limit = TIER_LIMITS[data.planType];
        setIsOverLimit(limit !== null && data.playgroundRunsThisMonth >= limit);
      } catch (e) {
        console.error("Error fetching usage:", e);
      }
    }
    fetchUsage();
  }, []);

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
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error?.includes('Insufficient credits') || data.error?.includes('upgrade')) {
          setShowUpgrade(true);
          throw new Error(data.error);
        }
        throw new Error(data.error || "Failed to run prompt");
      }
      
      setOutput(data.result || "No output");
      if (onResult) onResult(data.result || "No output");
      // Refetch usage after a run
      if (usage) {
        setUsage((prevState: Usage | null) => {
          if (!prevState) return null;
          return { ...prevState, playgroundRunsThisMonth: prevState.playgroundRunsThisMonth + 1 };
        });
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
          {usage.planType !== "PRO" && (
            <span>| Playground runs left this month: <b>{usage.playgroundRunsThisMonth} / {usage.planType === "FREE" ? 20 : 300}</b></span>
          )}
          {usage.planType === "PRO" && <span>| Unlimited Playground runs</span>}
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
          <b>You've run out of credits!</b><br />
          {error?.includes('Insufficient credits') ? (
            <>
              You need more credits to continue using the Playground.<br />
              Please purchase more credits to continue.
            </>
          ) : error?.includes('upgrade') ? (
            <>
              This feature requires a Pro subscription.<br />
              Please upgrade your plan to continue.
            </>
          ) : (
            <>
              You've reached your Playground run limit for this month.<br />
              Upgrade your plan for more runs!
            </>
          )}
        </div>
      )}
      {error && !showUpgrade && <div className="mt-4 text-red-500">{error}</div>}
      {output && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <strong>AI Output:</strong>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
} 
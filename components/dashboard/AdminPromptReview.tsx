'use client';
import { useEffect, useState } from 'react';

export function AdminPromptReview() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/prompts/admin');
      if (!res.ok) throw new Error('Failed to fetch pending prompts');
      setPending(await res.json());
    } catch (err) {
      setError('Could not load pending prompts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (promptId: string) => {
    await fetch('/api/prompts/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId }),
    });
    fetchPending();
  };
  const handleReject = async (promptId: string) => {
    await fetch('/api/prompts/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptId }),
    });
    fetchPending();
  };

  // TODO: Replace with real admin check
  const isAdmin = true;

  if (!isAdmin) return null;

  return (
    <section className="my-8">
      <h2 className="mb-4 text-2xl font-bold">Admin: Pending Prompt Review</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {pending.length === 0 && !loading && <p>No prompts pending review.</p>}
        {pending.map(prompt => (
          <div
            key={prompt.id}
            className="flex flex-col gap-4 rounded border bg-white p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="text-lg font-semibold">{prompt.name}</div>
              <div className="mb-2 text-gray-600">{prompt.description}</div>
              <div className="mb-2 flex flex-wrap gap-2">
                {prompt.tags.map((tag: any) => (
                  <span key={tag.id} className="rounded bg-gray-200 px-2 py-1 text-xs">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">Upvotes: {prompt.upvotes}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(prompt.id)}
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(prompt.id)}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

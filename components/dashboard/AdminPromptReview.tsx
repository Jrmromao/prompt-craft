"use client";
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

  useEffect(() => { fetchPending(); }, []);

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
      <h2 className="text-2xl font-bold mb-4">Admin: Pending Prompt Review</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {pending.length === 0 && !loading && <p>No prompts pending review.</p>}
        {pending.map(prompt => (
          <div key={prompt.id} className="border rounded p-4 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="font-semibold text-lg">{prompt.name}</div>
              <div className="text-gray-600 mb-2">{prompt.description}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {prompt.tags.map((tag: any) => (
                  <span key={tag.id} className="bg-gray-200 text-xs px-2 py-1 rounded">{tag.name}</span>
                ))}
              </div>
              <div className="text-sm text-gray-500">Upvotes: {prompt.upvotes}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleApprove(prompt.id)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Approve</button>
              <button onClick={() => handleReject(prompt.id)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 
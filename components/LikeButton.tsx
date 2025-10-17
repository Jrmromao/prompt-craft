'use client';

import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

export function LikeButton({ slug, initialLikes }: { slug: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/blog/${slug}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) {
        console.error('Like failed:', res.status, res.statusText);
        return;
      }

      const text = await res.text();
      if (!text) {
        console.error('Empty response');
        return;
      }

      const data = JSON.parse(text);
      
      if (data.likes !== undefined) {
        setLikes(data.likes);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-all ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <ThumbsUp className="w-4 h-4" />
      <span className="font-medium">{likes}</span>
    </button>
  );
}

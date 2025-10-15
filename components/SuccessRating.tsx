'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';

interface SuccessRatingProps {
  runId: string;
  onRate: (success: boolean, rating?: number) => void;
}

export function SuccessRating({ runId, onRate }: SuccessRatingProps) {
  const [rated, setRated] = useState(false);
  const [showStars, setShowStars] = useState(false);

  const handleThumb = async (success: boolean) => {
    setRated(true);
    if (success) {
      setShowStars(true);
    } else {
      await onRate(success);
    }
  };

  const handleStarRating = async (rating: number) => {
    await onRate(true, rating);
    setShowStars(false);
  };

  if (rated && !showStars) {
    return <div className="text-sm text-green-600">✓ Thanks for your feedback!</div>;
  }

  return (
    <div className="flex items-center gap-4">
      {!showStars ? (
        <>
          <span className="text-sm text-gray-600">Was this helpful?</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleThumb(true)}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <ThumbsUp className="w-5 h-5 text-gray-400 hover:text-green-600" />
            </button>
            <button
              onClick={() => handleThumb(false)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ThumbsDown className="w-5 h-5 text-gray-400 hover:text-red-600" />
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="text-sm text-gray-600">Rate quality:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => handleStarRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

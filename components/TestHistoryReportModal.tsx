import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Clock, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface TestHistoryReportModalProps {
  open: boolean;
  test: any; // TestHistoryItem | null
  rank?: number | null;
  onClose: () => void;
}

export function TestHistoryReportModal({ open, test, rank, onClose }: TestHistoryReportModalProps) {
  if (!test) return null;

  // Extract PromptRating ID and overall rating if available
  const promptRatingId = test.rating && test.rating.id ? test.rating.id : undefined;
  const overallRating = test.rating && typeof test.rating.overall === 'number' ? test.rating.overall : null;

  const renderRatingStars = (score: number) => (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < score ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-wrap items-center gap-3">
              <span>Test Report</span>
              {typeof rank === 'number' && rank > 0 && (
                <span className="inline-block bg-purple-600 text-white rounded-full px-3 py-1 text-xs font-bold align-middle">Rank #{rank}</span>
              )}
              {overallRating !== null && (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block bg-yellow-400 text-black rounded-full px-3 py-1 text-xs font-bold align-middle">Rating: {overallRating}/10</span>
                  {renderRatingStars(overallRating)}
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {promptRatingId && (
            <div className="text-xs text-muted-foreground">PromptRating ID: <span className="font-mono">{promptRatingId}</span></div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{new Date(test.createdAt).toLocaleString()}</span>
            {test.tokensUsed && (
              <span className="flex items-center gap-1"><Hash className="w-4 h-4" />{test.tokensUsed} tokens</span>
            )}
            {test.duration && (
              <span>{test.duration} ms</span>
            )}
          </div>
          {test.testInput && (
            <div>
              <div className="font-medium mb-1">Input</div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-sm font-mono whitespace-pre-wrap">{test.testInput}</div>
            </div>
          )}
          {test.testOutput && (
            <div>
              <div className="font-medium mb-1">Output</div>
              <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-900 rounded p-2">
                <ReactMarkdown>{test.testOutput}</ReactMarkdown>
              </div>
            </div>
          )}
          {test.rating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Overall Rating:</span>
                {renderRatingStars(test.rating.overall)}
                <span className="ml-2">{test.rating.overall}/10</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Clarity</span>
                  {renderRatingStars(test.rating.clarity)}
                  <span className="ml-1">{test.rating.clarity}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Specificity</span>
                  {renderRatingStars(test.rating.specificity)}
                  <span className="ml-1">{test.rating.specificity}/10</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Context</span>
                  {renderRatingStars(test.rating.context)}
                  <span className="ml-1">{test.rating.context}/10</span>
                </div>
              </div>
              {test.rating.feedback && (
                <div>
                  <div className="font-medium mb-1">Feedback</div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-sm">{test.rating.feedback}</div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
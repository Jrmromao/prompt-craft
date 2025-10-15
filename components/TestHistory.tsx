import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, Clock, Hash, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TestHistoryReportModal } from '@/components/TestHistoryReportModal';

interface TestHistoryItem {
  id: string;
  createdAt: string;
  testInput?: string;
  testOutput: string;
  tokensUsed?: number;
  duration?: number;
  rating?: {
    clarity: number;
    specificity: number;
    context: number;
    overall: number;
    feedback: string;
  };
}

interface TestHistoryProps {
  history: TestHistoryItem[];
  onSelectTest: (test: TestHistoryItem) => void;
}

export function TestHistory({ history, onSelectTest }: TestHistoryProps) {
  const [selectedTest, setSelectedTest] = useState<TestHistoryItem | null>(null);
  const [selectedRank, setSelectedRank] = useState<number | null>(null);

  const handleSelectTest = (test: TestHistoryItem, rank: number) => {
    setSelectedTest(test);
    setSelectedRank(rank);
    onSelectTest(test);
  };

  const renderRatingStars = (score: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${
              i < score
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Test History</h3>
          <span className="text-sm text-muted-foreground">
            {history.length} tests
          </span>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {history.map((test, idx) => (
              <Card
                key={test.id}
                className={`relative p-4 cursor-pointer transition-colors ${
                  selectedTest?.id === test.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:border-blue-300 dark:hover:border-blue-700'
                }`}
                onClick={() => handleSelectTest(test, idx + 1)}
              >
                <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                  {idx + 1}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {formatDistanceToNow(new Date(test.createdAt), { addSuffix: true })}
                    </div>
                    {test.tokensUsed && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Hash className="w-4 h-4" />
                        {test.tokensUsed} tokens
                      </div>
                    )}
                  </div>

                  {test.testInput && (
                    <div className="text-sm">
                      <span className="font-medium">Input:</span>{' '}
                      <span className="text-muted-foreground">
                        {test.testInput.length > 100
                          ? `${test.testInput.substring(0, 100)}...`
                          : test.testInput}
                      </span>
                    </div>
                  )}

                  {test.rating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Rating</span>
                        {renderRatingStars(test.rating.overall)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Clarity</span>
                          {renderRatingStars(test.rating.clarity)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Specificity</span>
                          {renderRatingStars(test.rating.specificity)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Context</span>
                          {renderRatingStars(test.rating.context)}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                        <p className="text-muted-foreground line-clamp-2">
                          {test.rating.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <TestHistoryReportModal
        open={!!selectedTest}
        test={selectedTest}
        rank={selectedRank}
        onClose={() => { setSelectedTest(null); setSelectedRank(null); }}
      />
    </Card>
  );
} 
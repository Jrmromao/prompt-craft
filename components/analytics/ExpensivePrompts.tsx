import { AlertCircle } from 'lucide-react';

interface PromptData {
  promptId: string;
  title: string;
  totalCost: number;
  runs: number;
  avgCost: number;
}

export function ExpensivePrompts({ data }: { data: PromptData[] }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Most Expensive Prompts</h3>
        <AlertCircle className="w-5 h-5 text-orange-500" />
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No prompts tracked yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((prompt, i) => (
            <div 
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium">{prompt.title}</div>
                <div className="text-sm text-gray-600">
                  {prompt.runs} runs • ${prompt.avgCost.toFixed(4)} avg
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  ${prompt.totalCost.toFixed(2)}
                </div>
                <a 
                  href={`/prompts/${prompt.promptId}`}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Optimize →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

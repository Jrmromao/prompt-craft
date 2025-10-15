'use client';

import { AlertCircle, TrendingUp } from 'lucide-react';

const MODEL_COSTS: Record<string, number> = {
  'gpt-4': 10,
  'gpt-4-turbo': 8,
  'gpt-3.5-turbo': 2,
  'claude-3-opus': 12,
  'claude-3-sonnet': 8,
  'claude-3-haiku': 3,
  'deepseek-chat': 1,
};

interface CostPreviewProps {
  model: string;
  promptLength: number;
  maxTokens: number;
  userCredits: number;
}

export function CostPreview({ model, promptLength, maxTokens, userCredits }: CostPreviewProps) {
  const baseCost = MODEL_COSTS[model] || 5;
  const lengthMultiplier = promptLength > 1000 ? 1.5 : 1;
  const tokenMultiplier = maxTokens > 500 ? 1.2 : 1;
  const estimatedCost = Math.ceil(baseCost * lengthMultiplier * tokenMultiplier);
  
  const afterTest = userCredits - estimatedCost;
  const canAfford = afterTest >= 0;

  return (
    <div className={`border rounded-lg p-4 ${canAfford ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Estimated Cost</span>
        <span className="text-2xl font-bold text-gray-900">~{estimatedCost} credits</span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>You have:</span>
          <span className="font-medium">{userCredits} credits</span>
        </div>
        <div className={`flex justify-between font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
          <span>After test:</span>
          <span>{afterTest} credits</span>
        </div>
      </div>

      {!canAfford && (
        <div className="mt-3 flex items-start gap-2 p-2 bg-red-100 rounded text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Insufficient credits</div>
            <a href="/pricing" className="underline hover:no-underline">
              Upgrade to PRO
            </a>
            {' or '}
            <a href="/account" className="underline hover:no-underline">
              buy credits
            </a>
          </div>
        </div>
      )}

      {canAfford && afterTest < 20 && (
        <div className="mt-3 flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
          <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            Running low on credits.{' '}
            <a href="/pricing" className="underline hover:no-underline">
              Get more
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

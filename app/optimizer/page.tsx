'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingDown, Zap, CheckCircle2, DollarSign, Clock, Target } from 'lucide-react';

interface Suggestion {
  type: 'cost' | 'performance' | 'quality';
  title: string;
  description: string;
  potentialSavings?: number;
  impact?: string;
  actionUrl?: string;
}

export default function OptimizerPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    fetch('/api/optimization/suggestions')
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.data || []);
        setTotalSavings(data.data?.reduce((sum: number, s: Suggestion) => sum + (s.potentialSavings || 0), 0) || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'cost': return <DollarSign className="w-5 h-5" />;
      case 'performance': return <Zap className="w-5 h-5" />;
      case 'quality': return <Target className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'cost': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'performance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'quality': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-64 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-96 mb-8"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-zinc-900 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <h1 className="text-3xl font-bold">AI Cost Optimizer</h1>
        </div>
        <p className="text-zinc-400 mb-8">
          AI-powered suggestions to reduce costs, improve performance, and increase quality
        </p>

        {totalSavings > 0 && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Potential Monthly Savings</p>
                <p className="text-4xl font-bold text-green-500">${totalSavings.toFixed(2)}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-green-500" />
            </div>
          </div>
        )}

        {suggestions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">All Optimized!</h2>
            <p className="text-zinc-400">
              Your prompts are running efficiently. We'll notify you when we find optimization opportunities.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg border ${getColor(suggestion.type)}`}>
                    {getIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                      {suggestion.impact && (
                        <span className="text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                          {suggestion.impact}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 mb-4">{suggestion.description}</p>
                    {suggestion.potentialSavings && (
                      <div className="flex items-center gap-2 text-sm text-green-500">
                        <DollarSign className="w-4 h-4" />
                        <span>Save ${suggestion.potentialSavings.toFixed(2)}/month</span>
                      </div>
                    )}
                    {suggestion.actionUrl && (
                      <a
                        href={suggestion.actionUrl}
                        className="inline-block mt-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors text-sm font-medium"
                      >
                        View Prompt
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium">Continuous Analysis</h4>
              </div>
              <p className="text-sm text-zinc-400">
                We analyze your prompt usage patterns 24/7 to find optimization opportunities
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium">AI-Powered</h4>
              </div>
              <p className="text-sm text-zinc-400">
                Machine learning models identify cost savings without sacrificing quality
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-purple-500" />
                <h4 className="font-medium">Automatic Savings</h4>
              </div>
              <p className="text-sm text-zinc-400">
                Apply suggestions with one click or enable auto-optimization in SDK
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

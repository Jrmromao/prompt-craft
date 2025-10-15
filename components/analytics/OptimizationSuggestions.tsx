'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, DollarSign, Zap, TrendingUp } from 'lucide-react';

interface Suggestion {
  type: 'cost' | 'performance' | 'quality';
  title: string;
  description: string;
  potentialSavings?: number;
  impact?: string;
  actionUrl?: string;
}

export function OptimizationSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch('/api/optimization/suggestions');
      const json = await res.json();
      if (json.success) {
        setSuggestions(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-6 text-center">
        <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No optimization suggestions yet</p>
        <p className="text-sm text-gray-500 mt-1">Keep using the platform to get personalized tips</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'cost': return DollarSign;
      case 'performance': return Zap;
      case 'quality': return TrendingUp;
      default: return Lightbulb;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'cost': return 'text-green-600 bg-green-50';
      case 'performance': return 'text-blue-600 bg-blue-50';
      case 'quality': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-bold">Optimization Suggestions</h3>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, i) => {
          const Icon = getIcon(suggestion.type);
          const colorClass = getColor(suggestion.type);

          return (
            <div key={i} className="border rounded-lg p-4 hover:border-purple-200 transition-colors">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  {suggestion.impact && (
                    <div className="inline-block px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                      {suggestion.impact}
                    </div>
                  )}
                  {suggestion.actionUrl && (
                    <a
                      href={suggestion.actionUrl}
                      className="block mt-2 text-sm text-purple-600 hover:underline"
                    >
                      Take action →
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

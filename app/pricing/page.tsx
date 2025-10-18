'use client';

import { useState, useEffect } from 'react';

interface PricingData {
  model: string;
  provider: string;
  inputCost: number;
  outputCost: number;
  averageCost: number;
  region?: string;
  cacheHit?: boolean;
  cacheHitCost?: number;
  lastUpdated: string;
  source: string;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/scrape');
      const data = await response.json();
      
      if (data.success) {
        setPricing(data.data);
      } else {
        setError(data.error || 'Failed to fetch pricing');
      }
    } catch (err) {
      setError('Failed to fetch pricing data');
    } finally {
      setLoading(false);
    }
  };

  const triggerScrape = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/scrape', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        await fetchPricing(); // Refresh data
      } else {
        setError(data.error || 'Failed to scrape pricing');
      }
    } catch (err) {
      setError('Failed to trigger pricing scrape');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(4)}`;

  const groupByProvider = (data: PricingData[]) => {
    return data.reduce((acc, item) => {
      if (!acc[item.provider]) {
        acc[item.provider] = [];
      }
      acc[item.provider].push(item);
      return acc;
    }, {} as Record<string, PricingData[]>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPricing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedPricing = groupByProvider(pricing);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            AI Model Pricing Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={triggerScrape}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Scraping...' : 'Update Pricing'}
            </button>
            <button
              onClick={fetchPricing}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {pricing.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No pricing data available</div>
            <p className="text-gray-400">Click "Update Pricing" to scrape current rates</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPricing).map(([provider, models]) => (
              <div key={provider} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {provider} ({models.length} models)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Input Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Output Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cache Hit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {models.map((model) => (
                        <tr key={model.model}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {model.model}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPrice(model.inputCost)}/1M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatPrice(model.outputCost)}/1M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatPrice(model.averageCost)}/1M
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {model.cacheHit ? (
                              <span className="text-green-600">
                                {model.cacheHitCost ? formatPrice(model.cacheHitCost) : 'Yes'}
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(model.lastUpdated).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { PLANS } from '@/lib/plans';

export function PricingCards() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    
    setLoading(planId);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-6">
      {Object.entries(PLANS).map(([key, plan]) => (
        <div
          key={key}
          className={`border rounded-xl p-6 ${
            key === 'PRO' ? 'border-purple-500 shadow-lg scale-105' : 'border-gray-200'
          }`}
        >
          {key === 'PRO' && (
            <div className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full w-fit mb-4">
              Most Popular
            </div>
          )}
          
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-gray-500">/month</span>
          </div>

          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading === plan.id || plan.id === 'free'}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              key === 'PRO'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                : 'bg-gray-100 hover:bg-gray-200'
            } disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading === plan.id ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : plan.id === 'free' ? (
              'Current Plan'
            ) : (
              'Subscribe'
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

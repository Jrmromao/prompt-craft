"use client";

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryExamplePage() {
  const [count, setCount] = useState(0);

  const handleError = () => {
    try {
      throw new Error('This is a test error');
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const handlePerformanceTest = () => {
    Sentry.startSpan(
      {
        op: 'ui.click',
        name: 'Performance Test Button Click',
      },
      async (span) => {
        // Simulate some work
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Add some metrics
        span.setAttribute('count', count);
        span.setAttribute('timestamp', new Date().toISOString());
        
        setCount((prev) => prev + 1);
      }
    );
  };

  const handleLoggingTest = () => {
    const { logger } = Sentry;
    
    logger.trace('Starting logging test', { count });
    logger.debug(logger.fmt`Current count: ${count}`);
    logger.info('Button clicked', { button: 'logging' });
    logger.warn('Count is getting high', { count, threshold: 5 });
    
    if (count > 10) {
      logger.error('Count exceeded limit', { count, limit: 10 });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sentry Features Demo</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Error Tracking</h2>
          <p className="mb-4">Click to trigger an error that will be captured by Sentry</p>
          <button
            onClick={handleError}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Trigger Error
          </button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Performance Monitoring</h2>
          <p className="mb-4">Click to test performance monitoring with spans</p>
          <button
            onClick={handlePerformanceTest}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Performance
          </button>
          <p className="mt-2">Count: {count}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Structured Logging</h2>
          <p className="mb-4">Click to test different log levels</p>
          <button
            onClick={handleLoggingTest}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Logging
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';

interface UpgradeEvent {
  location: string;
  plan: string;
  savings: number;
  timeAgo: string;
}

const mockEvents: UpgradeEvent[] = [
  { location: 'San Francisco', plan: 'Pro', savings: 847, timeAgo: '2 min ago' },
  { location: 'London', plan: 'Enterprise', savings: 3420, timeAgo: '5 min ago' },
  { location: 'New York', plan: 'Starter', savings: 156, timeAgo: '8 min ago' },
  { location: 'Berlin', plan: 'Pro', savings: 1240, timeAgo: '12 min ago' },
  { location: 'Tokyo', plan: 'Starter', savings: 89, timeAgo: '15 min ago' },
  { location: 'Sydney', plan: 'Enterprise', savings: 5600, timeAgo: '18 min ago' },
];

export function SocialProofTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % mockEvents.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const event = mockEvents[currentIndex];

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-sm">Someone in {event.location}</span>
              <span className="text-xs text-muted-foreground">{event.timeAgo}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Upgraded to <strong className="text-purple-600">{event.plan}</strong>
            </p>
            <p className="text-xs text-green-600 font-medium mt-1">
              Now saving ${event.savings}/month on AI costs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

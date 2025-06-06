'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-primary transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      <Sun
        className={`h-5 w-5 text-yellow-500 transition-opacity duration-200 ${isDark ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden={isDark}
      />
      <Moon
        className={`h-5 w-5 text-gray-700 dark:text-gray-300 absolute transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-0'}`}
        aria-hidden={!isDark}
      />
    </Button>
  );
} 
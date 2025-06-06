'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
interface ThemeContextProps {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Helper to get system theme
  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // Set theme on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    let initial: Theme = 'system';
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      initial = stored;
    }
    setTheme(initial);
    setMounted(true);
  }, []);

  // Listen for system theme changes if theme is 'system'
  useEffect(() => {
    if (!mounted) return;
    if (theme === 'system') {
      const updateSystemTheme = () => setResolvedTheme(getSystemTheme());
      updateSystemTheme();
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', updateSystemTheme);
      return () =>
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .removeEventListener('change', updateSystemTheme);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, mounted, getSystemTheme]);

  // Update <html> class and localStorage when theme or resolvedTheme changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('theme', theme);
    if ((theme === 'system' ? resolvedTheme : theme) === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, resolvedTheme, mounted]);

  const toggleTheme = () =>
    setTheme(t => (t === 'dark' ? 'light' : t === 'light' ? 'dark' : getSystemTheme()));

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

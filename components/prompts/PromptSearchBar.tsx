import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React from 'react';

interface PromptSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PromptSearchBar({ value, onChange, placeholder = 'Search prompts...', className = '' }: PromptSearchBarProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
} 
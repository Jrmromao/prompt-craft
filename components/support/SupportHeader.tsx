'use client';

import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export function SupportHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <div
        className="mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
        aria-label="PromptHive Logo"
      >
        <Sparkles className="h-8 w-8 text-gray-700 dark:text-gray-200" aria-hidden="true" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">PromptHive Support</h1>
      <p className="mt-2 max-w-xl text-gray-700 dark:text-gray-200">
        Create &amp; share AI prompts.
        <br />
        Need help? Our team is here to support your creative journey!
      </p>
    </div>
  );
}

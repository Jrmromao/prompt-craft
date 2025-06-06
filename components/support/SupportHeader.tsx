'use client';

import Image from 'next/image';

export function SupportHeader() {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      {/* Replace with your logo if available */}
      <Image src="/logo.svg" alt="PromptCraft Logo" width={56} height={56} className="mb-2" />
      <h1 className="text-3xl font-extrabold text-primary">PromptCraft Support</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Create &amp; share AI prompts.
        <br />
        Need help? Our team is here to support your creative journey!
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createHash } from 'crypto';

interface GravatarProps {
  email: string;
  size?: number;
  className?: string;
}

export function Gravatar({ email, size = 32, className = '' }: GravatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!email) return;

    // Create MD5 hash of the email
    const hash = createHash('md5')
      .update(email.trim().toLowerCase())
      .digest('hex');

    // Construct Gravatar URL
    const url = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;
    setAvatarUrl(url);
  }, [email, size]);

  if (!avatarUrl) {
    return (
      <div
        className={`rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-purple-600 dark:text-purple-300">
          {email.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={`Avatar for ${email}`}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
    />
  );
} 
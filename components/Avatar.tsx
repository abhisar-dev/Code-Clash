'use client';

import React, { useState } from 'react';
import { getInitials, getAvatarColor } from '@/lib/auth';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base font-bold',
  };

  const hasImage = Boolean(avatarUrl && avatarUrl.trim() && failedUrl !== avatarUrl);

  if (hasImage && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Profile avatar of ${name}`}
        loading="lazy"
        decoding="async"
        onError={() => setFailedUrl(avatarUrl)}
        className={`${sizeClasses[size]} rounded-full object-cover border border-zinc-200/60 dark:border-white/10 shrink-0 shadow-2xs ${className}`}
      />
    );
  }

  const { bg, text, border } = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} ${bg} ${text} ${border} border rounded-full font-mono font-semibold flex items-center justify-center shrink-0 tracking-tight shadow-inner select-none ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}

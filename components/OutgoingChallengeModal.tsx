'use client';

import React from 'react';
import { Swords, X, Loader2 } from 'lucide-react';
import { ChallengeInvite } from '@/lib/presence-store';

interface OutgoingChallengeModalProps {
  invite: ChallengeInvite | null;
  statusMessage?: string;
  onCancel: () => void;
}

export function OutgoingChallengeModal({
  invite,
  statusMessage,
  onCancel,
}: OutgoingChallengeModalProps) {
  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="w-full max-w-xs bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-center p-5 space-y-3.5 transition-colors">
        {/* Animated Icon */}
        <div className="w-10 h-10 mx-auto rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Swords className="w-4 h-4 animate-pulse" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Challenging {invite.toUserName}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
            @{invite.toUserHandle}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
          <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
          <span>{statusMessage || 'Waiting for consent to start...'}</span>
        </div>

        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Match begins immediately once accepted.
        </p>

        <div className="pt-1">
          <button
            onClick={onCancel}
            className="w-full py-1.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs border border-zinc-200/60 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>Cancel Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
}

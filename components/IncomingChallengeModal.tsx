'use client';

import React, { useState, useEffect } from 'react';
import { Swords, Check, X, Clock } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { ChallengeInvite } from '@/lib/presence-store';

interface IncomingChallengeModalProps {
  invite: ChallengeInvite | null;
  onAccept: (invite: ChallengeInvite) => void;
  onDecline: (invite: ChallengeInvite) => void;
}

export function IncomingChallengeModal({
  invite,
  onAccept,
  onDecline,
}: IncomingChallengeModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    if (!invite) return;
    const remaining = Math.max(1, Math.round((invite.expiresAt - Date.now()) / 1000));
    setSecondsLeft(remaining);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(invite);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [invite, onDecline]);

  if (!invite) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-center transition-colors">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
          <div className="w-9 h-9 mx-auto mb-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Swords className="w-4 h-4" />
          </div>

          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Contest Challenge
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            1v1 Peer Coding Invitation
          </p>
        </div>

        {/* Challenger Card */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 text-left">
            <Avatar
              name={invite.fromUser.name}
              avatarUrl={invite.fromUser.avatarUrl}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 text-xs truncate">
                {invite.fromUser.name}
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                <span className="font-mono text-zinc-600 dark:text-zinc-300">@{invite.fromUser.handle}</span> • {invite.fromUser.college}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                Rating: <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{invite.fromUser.elo}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 dark:text-zinc-500 px-0.5">
            <span>5 Problems (45m)</span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
              <Clock className="w-3 h-3 text-sky-500" />
              <span>Expires in {secondsLeft}s</span>
            </span>
          </div>

          {/* Action Buttons: Accept / Decline */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => onDecline(invite)}
              className="py-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs border border-zinc-200/60 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <span>Decline</span>
            </button>

            <button
              onClick={() => onAccept(invite)}
              className="py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-sky-500/20"
            >
              <Check className="w-3.5 h-3.5 text-white" />
              <span>Accept Duel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

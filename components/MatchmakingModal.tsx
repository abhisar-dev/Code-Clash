'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@/components/Avatar';
import { User } from '@/lib/auth';
import { Problem } from '@/lib/problems';

export type DuelDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

interface MatchmakingModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
  onMatchFound: (
    roomId: string,
    opponent: { name: string; handle: string; elo: number; avatarUrl?: string },
    problems?: Problem[]
  ) => void;
}

export function MatchmakingModal({ isOpen, user, onClose, onMatchFound }: MatchmakingModalProps) {
  const [status, setStatus] = useState<'searching' | 'found'>('searching');
  const [difficulty, setDifficulty] = useState<DuelDifficulty>('Mixed');
  const [matchedOpponent, setMatchedOpponent] = useState<{
    name: string;
    handle: string;
    elo: number;
    avatarUrl?: string;
  } | null>(null);
  const [secondsWaiting, setSecondsWaiting] = useState(0);
  const isCancelledRef = useRef(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMatched = (data: {
    roomId: string;
    opponent: { name: string; handle: string; elo: number; avatarUrl?: string };
    problems?: Problem[];
  }) => {
    if (isCancelledRef.current) return;
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    setStatus('found');
    setMatchedOpponent(data.opponent);

    setTimeout(() => {
      if (isCancelledRef.current) return;
      onMatchFound(data.roomId, data.opponent, data.problems);
    }, 1500);
  };

  const triggerBotFallback = async () => {
    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fallback_bot', user, difficulty }),
      });
      const data = await res.json();
      if (data.status === 'matched') {
        handleMatched(data);
      }
    } catch (e) {
      console.error('Fallback bot match error:', e);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStatus('searching');
      setMatchedOpponent(null);
      setSecondsWaiting(0);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      return;
    }

    isCancelledRef.current = false;
    setStatus('searching');
    setSecondsWaiting(0);

    const secondTimer = setInterval(() => {
      setSecondsWaiting((s) => s + 1);
    }, 1000);

    // Initial Join
    const startMatchmaking = async () => {
      try {
        const res = await fetch('/api/matchmaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join', user, difficulty }),
        });
        const data = await res.json();

        if (isCancelledRef.current) return;

        if (data.status === 'matched') {
          handleMatched(data);
          return;
        }

        // Start polling queue
        pollTimerRef.current = setInterval(async () => {
          if (isCancelledRef.current) return;
          try {
            const pollRes = await fetch('/api/matchmaking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'poll', user }),
            });
            const pollData = await pollRes.json();
            if (pollData.status === 'matched') {
              handleMatched(pollData);
            }
          } catch (err) {
            console.error('Poll error:', err);
          }
        }, 1200);
      } catch (err) {
        console.error('Matchmaking error:', err);
      }
    };

    startMatchmaking();

    return () => {
      isCancelledRef.current = true;
      clearInterval(secondTimer);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', user }),
      }).catch(() => {});
    };
  }, [isOpen, user, difficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden text-center p-6 space-y-4">
        {/* Match Status Header */}
        <div className="w-14 h-14 mx-auto rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-center font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
          {status === 'searching' ? `${secondsWaiting}s` : 'OK'}
        </div>

        {/* Text Details */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[10px] font-mono text-stone-700 dark:text-stone-300 font-semibold mb-2">
            <span>1v1 PEER MATCHMAKING</span>
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            {status === 'searching' ? 'Searching for Peer Opponent...' : 'Match Found!'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {status === 'searching'
              ? `Scanning campus queue for ${difficulty} duel in ${user.elo || 1000} ELO tier`
              : `Connected with ${matchedOpponent?.name} for ${difficulty} duel. Loading arena...`}
          </p>
        </div>

        {/* Difficulty Tier Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-left">
            Choose Difficulty Tier
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {(
              [
                { id: 'Easy', label: 'Easy', sub: 'Arrays' },
                { id: 'Medium', label: 'Medium', sub: 'Trees' },
                { id: 'Hard', label: 'Hard', sub: 'DP/Graph' },
                { id: 'Mixed', label: 'Mixed', sub: 'Classic' },
              ] as const
            ).map((tier) => (
              <button
                key={tier.id}
                type="button"
                disabled={status === 'found'}
                onClick={() => {
                  if (difficulty !== tier.id && status === 'searching') {
                    setDifficulty(tier.id);
                  }
                }}
                className={`py-2 px-1 rounded-lg text-xs font-medium cursor-pointer flex flex-col items-center justify-center ${
                  difficulty === tier.id
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs border border-zinc-200 dark:border-zinc-700'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                } ${status === 'found' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{tier.label}</span>
                <span className="text-[9px] font-mono opacity-70">{tier.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Match Preview Cards */}
        {status === 'found' && matchedOpponent && (
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={matchedOpponent.name} avatarUrl={matchedOpponent.avatarUrl} size="md" />
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">{matchedOpponent.name}</div>
                <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400">@{matchedOpponent.handle}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{matchedOpponent.elo} ELO</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Synced</div>
            </div>
          </div>
        )}

        {status === 'searching' && (
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 font-mono">
              <span>Waiting for campus peer in {difficulty} tier...</span>
            </div>
            {secondsWaiting >= 20 && (
              <button
                type="button"
                onClick={triggerBotFallback}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Match with AI Practice Rival Now
              </button>
            )}
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200 dark:border-zinc-700 cursor-pointer"
          >
            Cancel Search
          </button>
        </div>
      </div>
    </div>
  );
}

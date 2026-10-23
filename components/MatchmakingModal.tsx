'use client';

import React, { useState, useEffect } from 'react';
import { Swords, X, Loader2, Sparkles, UserCheck } from 'lucide-react';
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
    opponent: { name: string; handle: string; elo: number },
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

  useEffect(() => {
    if (!isOpen) {
      setStatus('searching');
      setMatchedOpponent(null);
      setSecondsWaiting(0);
      return;
    }

    setStatus('searching');
    setSecondsWaiting(0);

    const timer = setInterval(() => {
      setSecondsWaiting((s) => s + 1);
    }, 1000);

    let isCancelled = false;
    const findPeer = async () => {
      try {
        const res = await fetch('/api/matchmaking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'join', user, difficulty }),
        });
        const data = await res.json();

        if (data.status === 'matched' && !isCancelled) {
          setTimeout(() => {
            if (isCancelled) return;
            setStatus('found');
            setMatchedOpponent(data.opponent);

            setTimeout(() => {
              if (isCancelled) return;
              onMatchFound(data.roomId, data.opponent, data.problems);
            }, 1800);
          }, 1800);
        }
      } catch (err) {
        console.error('Matchmaking error:', err);
      }
    };

    findPeer();

    return () => {
      isCancelled = true;
      clearInterval(timer);
      fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', user }),
      }).catch(() => {});
    };
  }, [isOpen, user, difficulty, onMatchFound]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-center p-6 space-y-4 transition-colors">
        {/* Radar Icon / Match Status */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          {status === 'searching' ? (
            <>
              {/* Radar Ripples */}
              <div className="absolute inset-0 rounded-full border border-sky-500/30 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border border-sky-400/20 animate-pulse"></div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-500 shadow-inner">
                <Swords className="w-6 h-6 animate-pulse" />
              </div>
            </>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 animate-in zoom-in-95">
              <UserCheck className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Text Details */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[10px] font-mono text-sky-700 dark:text-sky-300 font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>1v1 PEER MATCHMAKING</span>
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
            {status === 'searching' ? 'Searching for Peer Opponent...' : 'Match Found!'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {status === 'searching'
              ? `Scanning campus queue for ${difficulty} duel in ${user.elo} ELO tier (${secondsWaiting}s elapsed)`
              : `Connected with ${matchedOpponent?.name} for ${difficulty} duel. Loading arena...`}
          </p>
        </div>

        {/* Difficulty Tier Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-left">
            Choose Difficulty Tier
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80">
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
                className={`py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex flex-col items-center justify-center ${
                  difficulty === tier.id
                    ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs border border-zinc-200/60 dark:border-zinc-700'
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
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <Avatar name={matchedOpponent.name} avatarUrl={matchedOpponent.avatarUrl} size="md" />
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-white">{matchedOpponent.name}</div>
                <div className="text-[11px] font-mono text-sky-600 dark:text-sky-400">@{matchedOpponent.handle}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-zinc-900 dark:text-white">{matchedOpponent.elo} ELO</div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Synced</div>
            </div>
          </div>
        )}

        {status === 'searching' && (
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
            <span>Matching with peers in {difficulty} tier...</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-medium text-xs border border-zinc-200/60 dark:border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-zinc-400" />
            <span>Cancel Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}

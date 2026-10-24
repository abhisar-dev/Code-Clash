'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/lib/auth';

export type DuelDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

interface LobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onStartContest: (roomId: string, difficulty: DuelDifficulty) => void;
}

export function LobbyModal({
  isOpen,
  onClose,
  onStartContest,
}: LobbyModalProps) {
  const [newRoomId, setNewRoomId] = useState('CLASH-7821');
  const [difficulty, setDifficulty] = useState<DuelDifficulty>('Mixed');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNewRoomId('CLASH-' + Math.floor(1000 + Math.random() * 9000));
  }, [isOpen]);

  if (!isOpen) return null;

  const getInviteUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/?invite=${newRoomId}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getInviteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = `Hey! Battle me live in a 1v1 ${difficulty} contest on CodeClash: ${getInviteUrl()}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/70 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[10px] font-mono text-stone-700 dark:text-stone-300 font-semibold mb-1">
              <span>CUSTOM 1v1 DUEL</span>
            </div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Host Private Duel
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 cursor-pointer font-bold">
            x
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Difficulty Tier Selector */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Select Duel Difficulty
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
                  onClick={() => setDifficulty(tier.id)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium cursor-pointer flex flex-col items-center justify-center ${
                    difficulty === tier.id
                      ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs border border-zinc-200 dark:border-zinc-700'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>{tier.label}</span>
                  <span className="text-[9px] font-mono opacity-70">{tier.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct WhatsApp Share button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-between cursor-pointer"
          >
            <span>Share via WhatsApp</span>
            <span className="text-[11px] font-mono opacity-80">Send →</span>
          </button>

          {/* Direct Link Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
              Direct Invite URL:
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-800 dark:text-zinc-200 break-all select-all">
              {typeof window !== 'undefined' ? getInviteUrl() : ''}
            </div>

            <button
              onClick={handleCopy}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-zinc-800 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Contest Structure summary */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 space-y-1">
            <div className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center justify-between">
              <span>Selected Problem Tier:</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono font-bold uppercase">{difficulty}</span>
            </div>
            {difficulty === 'Easy' && (
              <div>• 5 Apprentice Questions: Arrays, Strings, Basics (100-150 pts)</div>
            )}
            {difficulty === 'Medium' && (
              <div>• 5 Placement Questions: HashMaps, Trees, Two Pointers (250-350 pts)</div>
            )}
            {difficulty === 'Hard' && (
              <div>• 5 Grandmaster Questions: Dynamic Programming, Graphs (500 pts)</div>
            )}
            {difficulty === 'Mixed' && (
              <>
                <div>• Q1: Easy (100) • Q2: Easy (150)</div>
                <div>• Q3: Med (250) • Q4: Med (350) • Q5: Hard (500)</div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
          <button onClick={onClose} className="px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium cursor-pointer">
            Cancel
          </button>

          <button
            onClick={() => {
              onStartContest(newRoomId, difficulty);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Enter Arena →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

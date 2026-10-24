'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Swords, RotateCcw, Eye, Zap, X } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  isWinner: boolean;
  timeTakenSeconds: number;
  eloChange: number;
  newElo: number;
  onOpenInspector: () => void;
  onRematch: () => void;
  onClose: () => void;
}

export function VictoryModal({
  isOpen,
  isWinner,
  timeTakenSeconds,
  eloChange,
  newElo,
  onOpenInspector,
  onRematch,
  onClose,
}: VictoryModalProps) {
  useEffect(() => {
    if (isOpen && isWinner) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, isWinner]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60  flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Banner */}
        <div className="p-5 text-center relative border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50">
          <button onClick={onClose} className="absolute top-3.5 right-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>

          <div
            className={`w-10 h-10 mx-auto mb-2.5 rounded-lg flex items-center justify-center border ${
              isWinner
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400'
                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200/60 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {isWinner ? <Trophy className="w-5 h-5" /> : <Swords className="w-5 h-5" />}
          </div>

          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {isWinner ? 'Match Victory' : 'Match Concluded'}
          </h2>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            {isWinner
              ? 'You outscored your opponent in points.'
              : 'Opponent finished ahead on points.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="px-5 py-3.5 grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-center">
            <div className="text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] mb-0.5 font-mono">Time</div>
            <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">{formatTime(timeTakenSeconds)}</div>
          </div>

          <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-center">
            <div className="text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] mb-0.5 font-mono">Rating</div>
            <div
              className={`font-mono font-bold text-sm flex items-center justify-center gap-1 ${
                eloChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Zap className="w-3 h-3 fill-current text-sky-500" />
              <span>{eloChange >= 0 ? `+${eloChange}` : eloChange}</span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-1 text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
          New Rating: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{newElo} ELO</span>
        </div>

        {/* Actions */}
        <div className="p-5 pt-2 flex flex-col gap-2">
          {/* Solution Inspector */}
          <button
            onClick={onOpenInspector}
            className="w-full py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Inspect &amp; Compare Solutions</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onRematch}
              className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-sky-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rematch</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer border border-zinc-200/60 dark:border-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

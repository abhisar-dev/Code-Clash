'use client';

import React from 'react';
import { Problem } from '@/lib/problems';

interface ContestBarProps {
  problems: Problem[];
  currentIndex: number;
  onSelectProblem: (index: number) => void;
  playerScores: Record<string, number>;
  opponentScores: Record<string, number>;
  playerTotalScore: number;
  opponentTotalScore: number;
  opponentName: string;
  opponentIsTyping: boolean;
  opponentCurrentIndex: number;
}

export function ContestBar({
  problems,
  currentIndex,
  onSelectProblem,
  playerScores,
  playerTotalScore,
  opponentTotalScore,
  opponentName,
  opponentIsTyping,
  opponentCurrentIndex,
}: ContestBarProps) {
  return (
    <div className="h-10 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 sm:px-6 flex items-center justify-between text-xs select-none transition-colors">
      {/* Question Selector */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        {problems.map((prob, idx) => {
          const isSelected = currentIndex === idx;
          const isPlayerSolved = (playerScores[prob.id] || 0) > 0;

          return (
            <button
              key={prob.id}
              onClick={() => onSelectProblem(idx)}
              className={`h-7 px-2.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              <span>Q{idx + 1}</span>
              {isPlayerSolved && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Solved" />
              )}
            </button>
          );
        })}
      </div>

      {/* Opponent Status & Live Score */}
      <div className="flex items-center gap-4">
        {/* Opponent Typing Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              opponentIsTyping ? 'bg-sky-500 animate-pulse' : 'bg-zinc-300 dark:bg-zinc-700'
            }`}
          />
          <span>
            {opponentName} {opponentIsTyping ? 'typing...' : `viewing Q${opponentCurrentIndex + 1}`}
          </span>
        </div>

        {/* Live Score */}
        <div className="flex items-center gap-2 text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-white">{playerTotalScore}</span>
          <span className="text-zinc-400 font-sans">:</span>
          <span className="text-zinc-600 dark:text-zinc-300">{opponentTotalScore}</span>
          <span className="text-[10px] text-zinc-400 uppercase font-sans font-medium">pts</span>
        </div>
      </div>
    </div>
  );
}

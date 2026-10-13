'use client';

import React from 'react';
import { Timer, UserPlus } from 'lucide-react';
import { Language, Problem } from '@/lib/problems';
import { Player } from '@/lib/room-store';
import { Avatar } from '@/components/Avatar';

interface ArenaHeaderProps {
  problem: Problem;
  selectedLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  timeRemainingSeconds: number;
  player: Player;
  opponent: Player;
  onInviteFriend?: () => void;
}

export function ArenaHeader({
  problem,
  selectedLanguage,
  onLanguageChange,
  timeRemainingSeconds,
  player,
  opponent,
  onInviteFriend,
}: ArenaHeaderProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds < 120;
  const currentTotalTests = problem.testCases.length;
  const playerPass = player.passedCount[problem.id] || 0;
  const oppPass = opponent.passedCount[problem.id] || 0;

  return (
    <div className="h-11 bg-white dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 px-2 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none transition-colors overflow-hidden">
      {/* Problem title, Difficulty & Language selector */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-semibold text-xs text-zinc-900 dark:text-white max-w-[85px] sm:max-w-[180px] md:max-w-none truncate">
            {problem.title}
          </span>
          <span
            className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.5 rounded font-medium shrink-0 ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Language selector */}
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as Language)}
          className="bg-transparent text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs font-mono border-none focus:outline-none cursor-pointer py-0.5 shrink-0"
        >
          <option value="python" className="dark:bg-zinc-900">Python 3</option>
          <option value="javascript" className="dark:bg-zinc-900">JS</option>
          <option value="cpp" className="dark:bg-zinc-900">C++</option>
          <option value="java" className="dark:bg-zinc-900">Java</option>
        </select>
      </div>

      {/* Players & Countdown Timer */}
      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
        {/* You */}
        <div className="flex items-center gap-1.5">
          <Avatar name={player.name} avatarUrl={player.avatar} size="xs" />
          <div className="text-xs">
            <span className="font-medium text-zinc-800 dark:text-zinc-200 hidden sm:inline">{player.name}</span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 sm:ml-1.5">
              {playerPass}/{currentTotalTests}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-1 font-mono text-xs px-1.5 sm:px-2 py-0.5 rounded-md shrink-0 ${
            isLowTime
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold animate-pulse'
              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-transparent dark:border-zinc-800'
          }`}
        >
          <Timer className="w-3 h-3 text-zinc-400" />
          <span>{formatTime(timeRemainingSeconds)}</span>
        </div>

        {/* Opponent */}
        <div className="flex items-center gap-1.5">
          <div className="text-right text-xs">
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 sm:mr-1.5">
              {oppPass}/{currentTotalTests}
            </span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200 hidden sm:inline">{opponent.name}</span>
          </div>
          <Avatar name={opponent.name} avatarUrl={opponent.avatar} size="xs" />
          {opponent.id === 'opp-waiting' && onInviteFriend && (
            <button
              onClick={onInviteFriend}
              className="flex items-center gap-1 ml-1 px-1.5 sm:px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300/40 dark:border-sky-500/30 text-[10px] sm:text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
              title="Share a duel invite link with your friend"
            >
              <UserPlus className="w-3 h-3" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

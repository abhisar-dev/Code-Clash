'use client';

import React, { useState } from 'react';
import { Problem } from '@/lib/problems';
import { Player } from '@/lib/room-store';
import { X, RotateCcw, Swords } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Avatar } from '@/components/Avatar';

interface SolutionInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  player: Player;
  opponent: Player;
  winnerId: string | null;
  onRequestRematch: () => void;
  rematchRequestedBy: string | null;
  theme?: 'light' | 'dark';
}

export function SolutionInspectorModal({
  isOpen,
  onClose,
  problems,
  player,
  opponent,
  winnerId,
  onRequestRematch,
  rematchRequestedBy,
  theme = 'light',
}: SolutionInspectorModalProps) {
  const [selectedProbIndex, setSelectedProbIndex] = useState(0);

  if (!isOpen) return null;

  const currentProb = problems[selectedProbIndex] || problems[0];
  const playerCode = player.code[currentProb.id] || '// No submission recorded';
  const opponentCode = opponent.code[currentProb.id] || '// No submission recorded';

  const isPlayerWinner = winnerId === player.id;
  const isDraw = !winnerId;

  const hasOpponentRequestedRematch = rematchRequestedBy === opponent.id;
  const hasPlayerRequestedRematch = rematchRequestedBy === player.id;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60  flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-5xl h-[88vh] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-3.5 px-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Swords className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Solution Inspector
                </h2>
                <span
                  className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                    isPlayerWinner
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                      : isDraw
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800'
                  }`}
                >
                  {isPlayerWinner ? 'YOU WON' : isDraw ? 'DRAW' : 'DEFEAT'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Compare solutions side-by-side with {opponent.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Rematch Button */}
            <button
              onClick={onRequestRematch}
              disabled={hasPlayerRequestedRematch}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasOpponentRequestedRematch
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                  : hasPlayerRequestedRematch
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs shadow-sky-500/20'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>
                {hasOpponentRequestedRematch
                  ? 'Accept Rematch!'
                  : hasPlayerRequestedRematch
                  ? 'Requested...'
                  : 'Rematch'}
              </span>
            </button>

            <button onClick={onClose} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Problem Selector Bar */}
        <div className="h-9 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200/80 dark:border-zinc-800 px-3 flex items-center gap-1 overflow-x-auto">
          {problems.map((prob, idx) => (
            <button
              key={prob.id}
              onClick={() => setSelectedProbIndex(idx)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                selectedProbIndex === idx
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700 shadow-xs font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Q{idx + 1}: {prob.title}
            </button>
          ))}
        </div>

        {/* Side-by-Side Solution Editors */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden bg-white dark:bg-zinc-900">
          {/* Your Code Panel */}
          <div className="h-full flex flex-col border-r border-zinc-200/80 dark:border-zinc-800">
            <div className="h-8 px-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Avatar name={player.name} avatarUrl={player.avatar} size="xs" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{player.name} (You)</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {player.scores[currentProb.id] || 0} pts
              </span>
            </div>
            <div className="flex-1 relative bg-white dark:bg-zinc-950">
              <Editor
                height="100%"
                language={player.language || 'python'}
                value={playerCode}
                theme={isDark ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>

          {/* Opponent Code Panel */}
          <div className="h-full flex flex-col">
            <div className="h-8 px-3 border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/70 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <Avatar name={opponent.name} avatarUrl={opponent.avatar} size="xs" />
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{opponent.name}</span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {opponent.scores[currentProb.id] || 0} pts
              </span>
            </div>
            <div className="flex-1 relative bg-white dark:bg-zinc-950">
              <Editor
                height="100%"
                language={opponent.language || 'python'}
                value={opponentCode}
                theme={isDark ? 'vs-dark' : 'vs'}
                options={{
                  readOnly: true,
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 10, bottom: 10 },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

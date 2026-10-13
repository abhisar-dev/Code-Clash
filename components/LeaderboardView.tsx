'use client';

import React, { useState, useEffect } from 'react';
import { Search, Share2, Swords } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { User, getRegisteredUsers, getCurrentUser, getTier } from '@/lib/auth';
interface LeaderboardViewProps {
  onChallengeUser: (targetUser: User) => void;
  onOpenShareInvite?: () => void;
  onlineUserIds?: string[];
}

export function LeaderboardView({
  onChallengeUser,
  onOpenShareInvite,
  onlineUserIds = [],
}: LeaderboardViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const list = getRegisteredUsers();
    setUsers(list);
    setCurrentUser(getCurrentUser());
  }, []);

  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (u.name || '').toLowerCase().includes(query) ||
      (u.handle || '').toLowerCase().includes(query) ||
      (u.college || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Campus Standings
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
            Competitive ELO ratings &amp; live presence at {currentUser?.college || 'Invertis University'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contestants..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:bg-white dark:focus:bg-zinc-950 focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Solo Notice if single user */}
      {users.length <= 1 && onOpenShareInvite && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white">Invite classmates to challenge you</div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">Share your match link on WhatsApp to compete in 1v1 duels.</p>
          </div>
          <button
            onClick={onOpenShareInvite}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite Classmates</span>
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono font-medium uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-14">Rank</th>
                <th className="py-2.5 px-4">Contestant</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Rating</th>
                <th className="py-2.5 px-4">Record</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-400 dark:text-zinc-500">
                    No contestants matching &ldquo;{searchQuery}&rdquo;
                  </td>
                </tr>
              ) : (
                filteredUsers.map((c, index) => {
                  const rank = index + 1;
                  const isMe = currentUser?.id === c.id || currentUser?.handle === c.handle;
                  const isOnline = isMe || onlineUserIds.includes(c.id);
                  const matchesWon = c.matchesWon || 0;
                  const matchesPlayed = c.matchesPlayed || 0;
                  const matchesLost = Math.max(0, matchesPlayed - matchesWon);
                  const tier = getTier(c.elo || 1000);

                  return (
                    <tr
                      key={c.id || c.handle}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-sky-50/40 dark:bg-sky-950/30 hover:bg-sky-50/60 dark:hover:bg-sky-950/50'
                          : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-white">
                        #{rank}
                      </td>

                      {/* Contestant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} avatarUrl={c.avatarUrl} size="sm" />
                          <div>
                            <div className="font-medium text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <span>{c.name}</span>
                              {isMe && (
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                  (you)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                              @{c.handle} • {tier}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}></span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">{isOnline ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900 dark:text-white">
                        {c.elo || 1000}
                      </td>

                      {/* Record */}
                      <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                        <span className="text-emerald-600 dark:text-emerald-400">{matchesWon}W</span>
                        <span className="text-zinc-300 dark:text-zinc-700 mx-1">/</span>
                        <span>{matchesLost}L</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {isMe ? (
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 pr-2">Your Profile</span>
                        ) : isOnline ? (
                          <button
                            onClick={() => onChallengeUser(c)}
                            className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Swords className="w-3 h-3" />
                            <span>Challenge</span>
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-300 dark:text-zinc-600 pr-2">Offline</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

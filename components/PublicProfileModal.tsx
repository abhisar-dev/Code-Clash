'use client';

import React, { useEffect, useState } from 'react';
import { User } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import {
  X,
  Swords,
  Trophy,
  Award,
  Zap,
  GraduationCap,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Code2,
  Layers,
  ChevronRight,
  Shield,
  Activity,
} from 'lucide-react';
import { SkillBadge, Achievement } from '@/lib/gamification';

interface PublicProfileData {
  user: User;
  stats: {
    elo: number;
    tier: string;
    collegeRank?: number;
    globalRank: number;
    totalStudents: number;
    departmentRank: number;
    departmentTotal: number;
    department: string;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    winRate: string;
    totalSolved: number;
    totalProblemsInPool: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    totalEasy: number;
    totalMedium: number;
    totalHard: number;
    totalOnlineSeconds: number;
    totalOnlineHours: number;
    lastActiveAt?: number;
    topLanguages: { language: string; count: number }[];
    streak?: {
      currentStreak: number;
      longestStreak: number;
      isActiveToday: boolean;
    };
    clashPoints?: number;
  };
  badges: SkillBadge[];
  achievements: Achievement[];
  recentMatches: {
    id: string;
    roomId: string;
    opponent: {
      id: string;
      name: string;
      handle: string;
      avatarUrl?: string;
      elo: number;
    };
    outcome: 'Won' | 'Lost';
    myScore: number;
    oppScore: number;
    eloChange: number;
    durationSeconds: number;
    problemCount: number;
    timestamp: number;
    timeAgo: string;
  }[];
  recentSubmissions: {
    id: string;
    problemId: number | string;
    problemTitle: string;
    status: string;
    language: string;
    runtimeMs?: number;
    timestamp: number;
    timeAgo: string;
  }[];
}

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  currentUser: User | null;
  onChallengeUser: (user: User) => void;
}

export function PublicProfileModal({
  isOpen,
  onClose,
  targetUser,
  currentUser,
  onChallengeUser,
}: PublicProfileModalProps) {
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'matches' | 'submissions'>('overview');

  useEffect(() => {
    if (!isOpen || !targetUser) {
      setProfileData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const queryParam = targetUser.id
      ? `id=${encodeURIComponent(targetUser.id)}`
      : targetUser.handle
      ? `handle=${encodeURIComponent(targetUser.handle)}`
      : `name=${encodeURIComponent(targetUser.name)}`;

    fetch(`/api/user-profile?${queryParam}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load student profile');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProfileData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const isSelf = Boolean(
    currentUser &&
      (currentUser.id === targetUser.id ||
        (currentUser.handle &&
          targetUser.handle &&
          currentUser.handle.toLowerCase().replace('@', '') ===
            targetUser.handle.toLowerCase().replace('@', '')))
  );

  const uHandle = (targetUser.handle || profileData?.user?.handle || '').toLowerCase().replace('@', '');
  const isAbhisar = uHandle === 'abhisarkumar70' || targetUser.email?.toLowerCase() === 'abhisarkumar70@gmail.com';
  const user = {
    ...targetUser,
    ...(profileData?.user || {}),
    name: (isSelf && currentUser?.name) ? currentUser.name : (profileData?.user?.name || (isAbhisar ? 'Abhisar Kumar' : targetUser.name)),
    course: (isSelf && currentUser?.course) ? currentUser.course : (profileData?.user?.course || (isAbhisar ? 'BCA' : targetUser.course)),
    bio: (isSelf && currentUser?.bio) ? currentUser.bio : (profileData?.user?.bio || (isAbhisar ? 'BCA (AI & ML) @ Invertis University | Full-Stack & Machine Learning Developer' : targetUser.bio)),
    githubUrl: (isSelf && currentUser?.githubUrl) ? currentUser.githubUrl : (profileData?.user?.githubUrl || (isAbhisar ? 'https://github.com/abhisar-dev' : targetUser.githubUrl)),
    linkedinUrl: (isSelf && currentUser?.linkedinUrl) ? currentUser.linkedinUrl : (profileData?.user?.linkedinUrl || (isAbhisar ? 'https://www.linkedin.com/in/abhisar-kumar-89a2872a0' : targetUser.linkedinUrl)),
    avatarUrl:
      (() => {
        const candidate =
          (isSelf && currentUser?.avatarUrl) ||
          profileData?.user?.avatarUrl ||
          targetUser.avatarUrl ||
          (isAbhisar ? '/abhisar-profile.png' : undefined);
        return candidate && !candidate.includes('avatars.githubusercontent.com')
          ? candidate
          : (isAbhisar ? '/abhisar-profile.png' : undefined);
      })(),
  };
  const stats = profileData?.stats;

  return (
    <div className="fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#141210] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Verified Student Profile
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Header Card: Avatar, Identity, Rating & Duel CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-900/60 dark:via-[#181614] dark:to-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
                <span
                  className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-500 text-black shadow-xs"
                  title="College Rank"
                >
                  #{stats?.collegeRank || stats?.globalRank || 1}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight">
                    {user.name}
                  </h2>
                  {user.studentId && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700">
                      {user.studentId}
                    </span>
                  )}
                </div>

                <div className="text-xs text-zinc-400 font-mono mt-0.5">@{user.handle}</div>

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
                    <GraduationCap className="w-3 h-3" />
                    <span>{user.course || 'B.Tech CSE'}</span>
                  </span>

                  <span className="text-[11px] text-zinc-400 font-mono">
                    {user.college || 'Invertis University'}
                  </span>
                </div>
              </div>
            </div>

            {/* Duel Button / Self Tag */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
              <div className="text-left sm:text-right">
                <div className="text-xl font-black font-mono text-zinc-900 dark:text-white leading-none">
                  {stats?.elo || user.elo || 1000}{' '}
                  <span className="text-[10px] font-normal text-zinc-400 uppercase">ELO</span>
                </div>
                <div className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 font-mono mt-0.5">
                  {stats?.tier || 'Novice'}
                </div>
              </div>

              {!isSelf ? (
                <button
                  onClick={() => {
                    onClose();
                    onChallengeUser(user);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Challenge to 1v1</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  You (Current Account)
                </span>
              )}
            </div>
          </div>

          {/* User Bio if available */}
          {user.bio && (
            <div className="px-4 py-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-300 italic font-sans leading-relaxed">
              &ldquo;{user.bio}&rdquo;
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'badges'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Skill Badges ({profileData?.badges?.filter((b) => b.unlocked).length || 0})
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'matches'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Match History ({profileData?.recentMatches?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
                activeTab === 'submissions'
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Solves ({profileData?.stats.totalSolved || 0})
            </button>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="py-12 text-center text-xs text-zinc-400 font-mono animate-pulse">
              Syncing student telemetry and competitive records...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {!loading && !error && activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Quick Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>College Rank</span>
                  </div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">
                    #{stats?.collegeRank || stats?.globalRank || 1}{' '}
                    <span className="text-[10px] font-normal text-zinc-400">/ {stats?.totalStudents || 3}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
                    <span>Dept Rank</span>
                  </div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">
                    #{stats?.departmentRank || 1}{' '}
                    <span className="text-[10px] font-normal text-zinc-400">/ {stats?.departmentTotal || 1}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Daily Streak</span>
                  </div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">
                    {stats?.streak?.currentStreak || 0}{' '}
                    <span className="text-[10px] font-normal text-zinc-400">Days</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                  <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Win Rate</span>
                  </div>
                  <div className="text-base font-black font-mono text-zinc-900 dark:text-white mt-1">
                    {stats?.winRate || '0%'}{' '}
                    <span className="text-[10px] font-normal text-zinc-400 font-mono">
                      ({stats?.matchesWon || 0}W/{stats?.matchesLost || 0}L)
                    </span>
                  </div>
                </div>
              </div>

              {/* DSA Problem Solved Breakdown */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
                      Problems Solved
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                    {stats?.totalSolved || 0} / {stats?.totalProblemsInPool || 12}
                  </span>
                </div>

                {/* Progress bars: Easy, Medium, Hard */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Easy</span>
                      <span className="text-zinc-500">
                        {stats?.easySolved || 0} / {stats?.totalEasy || 5}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            stats?.totalEasy ? Math.min(100, ((stats.easySolved || 0) / stats.totalEasy) * 100) : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">Medium</span>
                      <span className="text-zinc-500">
                        {stats?.mediumSolved || 0} / {stats?.totalMedium || 5}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            stats?.totalMedium
                              ? Math.min(100, ((stats.mediumSolved || 0) / stats.totalMedium) * 100)
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Hard</span>
                      <span className="text-zinc-500">
                        {stats?.hardSolved || 0} / {stats?.totalHard || 2}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            stats?.totalHard ? Math.min(100, ((stats.hardSolved || 0) / stats.totalHard) * 100) : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Top Languages */}
                {stats?.topLanguages && stats.topLanguages.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">Preferred Languages:</span>
                    <div className="flex items-center gap-1.5">
                      {stats.topLanguages.map((l, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold"
                        >
                          {l.language} ({l.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Online Study Time & Activity */}
              <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <span>Total Campus Platform Study Time:</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {stats?.totalOnlineHours || 0} Hours
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SKILL BADGES */}
          {!loading && !error && activeTab === 'badges' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileData?.badges?.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      b.unlocked
                        ? 'bg-white dark:bg-zinc-900/80 border-amber-500/40 shadow-xs'
                        : 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          b.unlocked
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {b.title}
                          </h4>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold uppercase ${
                              b.unlocked
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {b.unlocked ? b.tier : 'Locked'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                          {b.requirement}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MATCH HISTORY */}
          {!loading && !error && activeTab === 'matches' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {profileData?.recentMatches && profileData.recentMatches.length > 0 ? (
                profileData.recentMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-md font-mono font-bold text-[10px] uppercase ${
                          m.outcome === 'Won'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800'
                        }`}
                      >
                        {m.outcome}
                      </span>

                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <span>vs {m.opponent.name}</span>
                          <span className="text-[11px] font-mono text-zinc-400">(@{m.opponent.handle})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {m.problemCount} Problem Duel • {m.timeAgo}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div
                        className={`font-bold ${
                          m.outcome === 'Won'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {m.outcome === 'Won' ? '+28' : '-18'} ELO
                      </div>
                      <div className="text-[10px] text-zinc-400">Score: {m.myScore} pts</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400 font-mono">
                  No 1v1 Arena duels played yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOLVED SUBMISSIONS */}
          {!loading && !error && activeTab === 'submissions' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {profileData?.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
                profileData.recentSubmissions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">
                        {s.problemTitle}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono mt-0.5 flex items-center gap-2">
                        <span className="uppercase text-sky-600 dark:text-sky-400 font-semibold">{s.language}</span>
                        <span>•</span>
                        <span>{s.timeAgo}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          s.status === 'Accepted'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {s.status}
                      </span>
                      {s.runtimeMs && (
                        <div className="text-[10px] text-zinc-400 mt-1">{s.runtimeMs}ms</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-zinc-400 font-mono">
                  No submissions evaluated yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

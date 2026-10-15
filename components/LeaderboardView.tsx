// components/LeaderboardView.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Share2,
  Swords,
  Trophy,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  Layers,
  Network,
  Cpu,
  Code2,
  Shield,
  GraduationCap,
  Globe,
  Calendar,
  Clock,
  Sparkles,
  Medal,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Check,
  Lock,
} from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { User, getRegisteredUsers, getCurrentUser, getTier, getMatchHistory, getSubmissions } from '@/lib/auth';
import {
  computeGamification,
  calculateStreakInfo,
  recordDailyActivity,
  GamificationState,
  SkillBadge,
  Achievement,
} from '@/lib/gamification';

type LeaderboardTab = 'global' | 'department' | 'badges' | 'achievements';
type TimeframeFilter = 'all_time' | 'month' | 'semester';

interface LeaderboardViewProps {
  onChallengeUser: (targetUser: User) => void;
  onSelectUser?: (targetUser: User) => void;
  onOpenShareInvite?: () => void;
  onlineUserIds?: string[];
  solvedProblemIds?: string[];
  onNavigateToDaily?: () => void;
}

const DEPARTMENTS = [
  'All Departments',
  'B.Tech CSE',
  'BCA',
  'MCA',
  'B.Tech AI & ML',
  'B.Tech Cyber Security',
] as const;

export function LeaderboardView({
  onChallengeUser,
  onSelectUser,
  onOpenShareInvite,
  onlineUserIds = [],
  solvedProblemIds = [],
  onNavigateToDaily,
}: LeaderboardViewProps) {
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all_time');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState<string>('All');

  // Users & State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Gamification Data for Current User
  const [gamification, setGamification] = useState<GamificationState | null>(null);

  // Fetch contestants from Server API with fallback to LocalStorage
  useEffect(() => {
    let isMounted = true;

    async function loadContestants() {
      const localCurrent = getCurrentUser();
      setCurrentUser(localCurrent);

      // Record daily activity today
      recordDailyActivity();

      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data.contestants && Array.isArray(data.contestants) && isMounted) {
            // Merge with local user if not present
            let merged = [...data.contestants];
            if (localCurrent && !merged.some((u) => u.id === localCurrent.id || u.handle === localCurrent.handle)) {
              merged.push(localCurrent);
            }
            setUsers(merged.sort((a, b) => (b.elo || 1000) - (a.elo || 1000)));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API leaderboard sync note:', err);
      }

      // Fallback to local registered users
      if (isMounted) {
        const localList = getRegisteredUsers();
        setUsers(localList);
        setLoading(false);
      }
    }

    loadContestants();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Gamification whenever solved problems or user changes
  useEffect(() => {
    const user = currentUser || getCurrentUser();
    const submissions = getSubmissions();
    const matches = getMatchHistory();
    const state = computeGamification(user, solvedProblemIds, submissions, matches, users);
    setGamification(state);
  }, [currentUser, solvedProblemIds, users]);

  // Compute Department Ranks for each user
  const departmentRankMap = useMemo(() => {
    const map = new Map<string, { rank: number; total: number; dept: string }>();
    const byDept: Record<string, User[]> = {};

    users.forEach((u) => {
      const d = (u.course || 'B.Tech CSE').trim();
      if (!byDept[d]) byDept[d] = [];
      byDept[d].push(u);
    });

    Object.entries(byDept).forEach(([dept, deptUsers]) => {
      const sorted = [...deptUsers].sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
      sorted.forEach((u, idx) => {
        map.set(u.id || u.handle, {
          rank: idx + 1,
          total: sorted.length,
          dept,
        });
      });
    });

    return map;
  }, [users]);

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let list = [...users];

    // 1. Department Filter
    if (selectedDept !== 'All Departments') {
      list = list.filter(
        (u) => (u.course || 'B.Tech CSE').toLowerCase().trim() === selectedDept.toLowerCase().trim()
      );
    }

    // 2. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.handle || '').toLowerCase().includes(q) ||
          (u.course || '').toLowerCase().includes(q) ||
          (u.studentId || '').toLowerCase().includes(q)
      );
    }

    // 3. Timeframe Sorting & Calculation
    if (timeframe === 'month') {
      // Prioritize users with high win rate and recent matches
      return list.sort((a, b) => {
        const scoreA = (a.matchesWon || 0) * 40 + (a.elo || 1000) * 0.5;
        const scoreB = (b.matchesWon || 0) * 40 + (b.elo || 1000) * 0.5;
        return scoreB - scoreA;
      });
    }

    if (timeframe === 'semester') {
      // Prioritize volume of played matches and rating
      return list.sort((a, b) => {
        const scoreA = (a.matchesPlayed || 0) * 20 + (a.elo || 1000);
        const scoreB = (b.matchesPlayed || 0) * 20 + (b.elo || 1000);
        return scoreB - scoreA;
      });
    }

    // Default: All-Time ELO
    return list.sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
  }, [users, selectedDept, searchQuery, timeframe]);

  // Top 3 Podium Coders
  const topThree = useMemo(() => {
    return processedUsers.slice(0, 3);
  }, [processedUsers]);

  // Department Stats for selected dept
  const deptStats = useMemo(() => {
    if (selectedDept === 'All Departments') return null;
    const deptUsers = users.filter(
      (u) => (u.course || 'B.Tech CSE').toLowerCase().trim() === selectedDept.toLowerCase().trim()
    );
    const topCoder = deptUsers[0];
    const avgElo = deptUsers.length > 0
      ? Math.round(deptUsers.reduce((acc, u) => acc + (u.elo || 1000), 0) / deptUsers.length)
      : 1000;
    return {
      count: deptUsers.length,
      topCoder,
      avgElo,
    };
  }, [users, selectedDept]);

  // Helper for rendering badge icons
  const renderBadgeIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'layers':
        return <Layers className={className} />;
      case 'network':
        return <Network className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'search':
        return <Search className={className} />;
      case 'code':
        return <Code2 className={className} />;
      case 'swords':
        return <Swords className={className} />;
      case 'check':
        return <CheckCircle2 className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'graduation':
        return <GraduationCap className={className} />;
      case 'globe':
        return <Globe className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Badges filtered by category
  const filteredBadges = useMemo(() => {
    if (!gamification) return [];
    if (selectedBadgeCategory === 'All') return gamification.badges;
    return gamification.badges.filter((b) => b.category === selectedBadgeCategory);
  }, [gamification, selectedBadgeCategory]);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-6xl mx-auto space-y-6">
      {/* 1. Header & Live Campus Telemetry Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              INVERTIS LEAGUE SEASON 2
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
              {users.length} Active Contestants
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Leaderboard &amp; Gamification
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official ELO rankings, department leaderboards, skill badges &amp; consistency streaks.
          </p>
        </div>

        {/* Global Summary Cards for Current User */}
        {gamification && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
            {/* College Rank */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">College Rank</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-white font-mono mt-0.5">
                #{gamification.collegeRank?.rank || gamification.globalRank.rank} <span className="text-[10px] text-zinc-400 font-normal">/ {gamification.collegeRank?.total || gamification.globalRank.total}</span>
              </div>
            </div>

            {/* Department Rank */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Dept Rank</div>
              <div className="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
                #{gamification.departmentRank.rank} <span className="text-[10px] text-zinc-400 font-normal">{gamification.departmentRank.department.replace('B.Tech ', '')}</span>
              </div>
            </div>

            {/* Daily Streak */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-current" />
                <span>Streak</span>
              </div>
              <div className="text-sm font-bold text-orange-500 font-mono mt-0.5">
                {gamification.streak.currentStreak} Days
              </div>
            </div>

            {/* Clash Points */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center shadow-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Clash Points</div>
              <div className="text-sm font-bold text-amber-500 font-mono mt-0.5">
                {gamification.clashPoints} <span className="text-[10px] text-zinc-400 font-normal">PTS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Streak Alert & Consistency Notification Banner */}
      {gamification?.streak.notification && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{gamification.streak.notification.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-600 dark:text-orange-400">
                  {gamification.streak.currentStreak}-DAY STREAK
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                {gamification.streak.notification.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Weekly Streak Tracker Mini-bar */}
            <div className="flex items-center gap-1 bg-white/70 dark:bg-zinc-900/70 p-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              {gamification.streak.daysHistory.map((d) => (
                <div
                  key={d.date}
                  title={`${d.dayLabel} (${d.date}): ${d.active ? 'Solved' : 'Missed'}`}
                  className={`w-6 h-6 rounded-md flex flex-col items-center justify-center text-[9px] font-mono font-bold transition-all ${
                    d.active
                      ? 'bg-orange-500 text-white'
                      : d.isToday
                      ? 'border border-dashed border-orange-400 text-orange-500'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <span>{d.dayLabel[0]}</span>
                </div>
              ))}
            </div>

            {onNavigateToDaily && (
              <button
                onClick={onNavigateToDaily}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Daily Challenge</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200/80 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'global'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>College Standings</span>
        </button>

        <button
          onClick={() => setActiveTab('department')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'department'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
          <span>Department Ranking</span>
          {gamification?.departmentRank && (
            <span className="px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-mono font-bold">
              #{gamification.departmentRank.rank}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'badges'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Skill Badges</span>
          {gamification && (
            <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
              {gamification.unlockedBadgesCount} / {gamification.badges.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'achievements'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          <span>Achievements &amp; Streaks</span>
          {gamification && (
            <span className="px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-mono font-bold">
              {gamification.unlockedAchievementsCount} / {gamification.achievements.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          TAB 1: GLOBAL STANDINGS
      ========================================================================= */}
      {activeTab === 'global' && (
        <div className="space-y-6">
          {/* Timeframe Selector & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Timeframe Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
              <button
                onClick={() => setTimeframe('all_time')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timeframe === 'all_time'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                All-Time Standings
              </button>

              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timeframe === 'month'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Top Coders This Month (Oct 2026)
              </button>

              <button
                onClick={() => setTimeframe('semester')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  timeframe === 'semester'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Fall Semester 2026
              </button>
            </div>

            {/* Contestant Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, handle, course..."
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          {/* Top Podium Cards (Dynamic for available real contestants) */}
          {topThree.length > 0 && !searchQuery && selectedDept === 'All Departments' && (
            <div
              className={`grid gap-3 pt-2 ${
                topThree.length === 1
                  ? 'grid-cols-1 max-w-sm mx-auto'
                  : topThree.length === 2
                  ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-3'
              }`}
            >
              {/* 2nd Place (Silver) if 2 or more contestants */}
              {topThree.length >= 2 && (
                <div
                  onClick={() => onSelectUser?.(topThree[1])}
                  className="order-2 md:order-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col items-center text-center relative overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    #2
                  </div>
                  <Avatar name={topThree[1].name} avatarUrl={topThree[1].avatarUrl} size="lg" />
                  <div className="font-bold text-sm text-zinc-900 dark:text-white mt-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {topThree[1].name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">@{topThree[1].handle}</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <GraduationCap className="w-3 h-3 text-sky-500" />
                    <span>{topThree[1].course || 'B.Tech CSE'}</span>
                  </div>
                  <div className="mt-3 text-base font-black font-mono text-zinc-900 dark:text-white">
                    {topThree[1].elo || 1000} <span className="text-[10px] font-normal text-zinc-400">ELO</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {topThree[1].matchesWon || 0}W / {Math.max(0, (topThree[1].matchesPlayed || 0) - (topThree[1].matchesWon || 0))}L
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Champion) */}
              <div
                onClick={() => onSelectUser?.(topThree[0])}
                className="order-1 md:order-2 p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-white dark:via-zinc-900 to-white dark:to-zinc-900 border-2 border-amber-500/40 dark:border-amber-500/30 flex flex-col items-center text-center relative overflow-hidden shadow-sm hover:border-amber-500/60 transition-all cursor-pointer group"
              >
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-white uppercase tracking-wider">
                    CHAMPION
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-mono font-black text-sm flex items-center justify-center mb-3 shadow-sm">
                  <Trophy className="w-4 h-4 fill-current" />
                </div>
                <Avatar name={topThree[0].name} avatarUrl={topThree[0].avatarUrl} size="lg" />
                <div className="font-bold text-base text-zinc-900 dark:text-white mt-2 flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <span>{topThree[0].name}</span>
                  <Medal className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-xs text-zinc-400 font-mono">@{topThree[0].handle}</div>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                  <GraduationCap className="w-3 h-3" />
                  <span>{topThree[0].course || 'B.Tech CSE'} Topper</span>
                </div>
                <div className="mt-3 text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                  {topThree[0].elo || 1000} <span className="text-xs font-normal text-zinc-400">ELO</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                  {topThree[0].matchesWon || 0}W / {Math.max(0, (topThree[0].matchesPlayed || 0) - (topThree[0].matchesWon || 0))}L • {getTier(topThree[0].elo || 1000)}
                </div>
              </div>

              {/* 3rd Place (Bronze) if 3 or more contestants */}
              {topThree.length >= 3 && (
                <div
                  onClick={() => onSelectUser?.(topThree[2])}
                  className="order-3 md:order-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col items-center text-center relative overflow-hidden shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-700/20 text-orange-700 dark:text-orange-400 font-mono font-bold text-xs flex items-center justify-center mb-3">
                    #3
                  </div>
                  <Avatar name={topThree[2].name} avatarUrl={topThree[2].avatarUrl} size="lg" />
                  <div className="font-bold text-sm text-zinc-900 dark:text-white mt-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {topThree[2].name}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">@{topThree[2].handle}</div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <GraduationCap className="w-3 h-3 text-sky-500" />
                    <span>{topThree[2].course || 'B.Tech CSE'}</span>
                  </div>
                  <div className="mt-3 text-base font-black font-mono text-zinc-900 dark:text-white">
                    {topThree[2].elo || 1000} <span className="text-[10px] font-normal text-zinc-400">ELO</span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {topThree[2].matchesWon || 0}W / {Math.max(0, (topThree[2].matchesPlayed || 0) - (topThree[2].matchesWon || 0))}L
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standings Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200/70 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">College Rank</th>
                    <th className="py-3 px-4">Contestant</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Combat Record</th>
                    <th className="py-3 px-4">Skill Badges</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        No contestants found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((c, index) => {
                      const rank = index + 1;
                      const isMe = currentUser?.id === c.id || currentUser?.handle === c.handle;
                      const isOnline = isMe || onlineUserIds.includes(c.id);
                      const matchesWon = c.matchesWon || 0;
                      const matchesPlayed = c.matchesPlayed || 0;
                      const matchesLost = Math.max(0, matchesPlayed - matchesWon);
                      const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
                      const tier = getTier(c.elo || 1000);
                      const deptRankInfo = departmentRankMap.get(c.id || c.handle);

                      return (
                        <tr
                          key={c.id || c.handle}
                          className={`transition-colors ${
                            isMe
                              ? 'bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-50/80 dark:hover:bg-sky-950/50'
                              : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                          }`}
                        >
                          {/* Rank with Medal */}
                          <td className="py-3.5 px-4 font-mono font-bold">
                            {rank === 1 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                1
                              </span>
                            ) : rank === 2 ? (
                              <span className="w-6 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-bold">
                                2
                              </span>
                            ) : rank === 3 ? (
                              <span className="w-6 h-6 rounded-full bg-orange-700/30 text-orange-700 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                                3
                              </span>
                            ) : (
                              <span className="text-zinc-500 dark:text-zinc-400 pl-1">#{rank}</span>
                            )}
                          </td>

                          {/* Contestant */}
                          <td
                            className="py-3.5 px-4 cursor-pointer group"
                            onClick={() => onSelectUser?.(c)}
                            title="View student public profile"
                          >
                            <div className="flex items-center gap-2.5">
                              <Avatar name={c.name} avatarUrl={c.avatarUrl} size="sm" />
                              <div>
                                <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  <span>{c.name}</span>
                                  {isMe && (
                                    <span className="px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-mono font-bold">
                                      you
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono">
                                  @{c.handle}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Department & Dept Rank */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-zinc-900 dark:text-white text-xs">
                                {c.course || 'B.Tech CSE'}
                              </span>
                              {deptRankInfo && (
                                <span className="text-[10px] font-mono text-zinc-400">
                                  Dept Rank #{deptRankInfo.rank} of {deptRankInfo.total}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Rating & Tier */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-zinc-900 dark:text-white">
                              {c.elo || 1000}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-medium">{tier}</div>
                          </td>

                          {/* Combat Record */}
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{matchesWon}W</span>
                              <span className="text-zinc-300 dark:text-zinc-700">/</span>
                              <span className="text-zinc-500">{matchesLost}L</span>
                            </div>
                            <div className="text-[10px] text-zinc-400">{winRate}% Win Rate</div>
                          </td>

                          {/* Skill Badges Preview */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 flex-wrap max-w-xs">
                              {c.badges && c.badges.length > 0 ? (
                                c.badges.slice(0, 2).map((b) => (
                                  <span
                                    key={b}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60"
                                  >
                                    {b.replace('_', ' ')}
                                  </span>
                                ))
                              ) : matchesWon >= 5 ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                  Duel Champion
                                </span>
                              ) : (
                                <span className="text-[11px] text-zinc-400 font-mono">Novice Coder</span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isOnline ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                                }`}
                              />
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right">
                            {isMe ? (
                              <span className="text-[11px] text-zinc-400 font-mono pr-2">Your Profile</span>
                            ) : (
                              <button
                                onClick={() => onChallengeUser(c)}
                                className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Swords className="w-3 h-3" />
                                <span>Challenge</span>
                              </button>
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
      )}

      {/* =========================================================================
          TAB 2: DEPARTMENT RANKINGS
      ========================================================================= */}
      {activeTab === 'department' && (
        <div className="space-y-6">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Department Leader Spotlight Card */}
          {deptStats && deptStats.topCoder && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-white dark:via-zinc-900 to-white dark:to-zinc-900 border border-sky-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar name={deptStats.topCoder.name} avatarUrl={deptStats.topCoder.avatarUrl} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {deptStats.topCoder.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500 text-white">
                      {selectedDept} #1
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">
                    @{deptStats.topCoder.handle} • {deptStats.topCoder.elo} ELO • {deptStats.topCoder.matchesWon || 0} Wins
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                  <div className="text-zinc-400 text-[10px]">Department Average</div>
                  <div className="font-bold text-zinc-900 dark:text-white">{deptStats.avgElo} ELO</div>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center">
                  <div className="text-zinc-400 text-[10px]">Classmates Ranked</div>
                  <div className="font-bold text-zinc-900 dark:text-white">{deptStats.count} Students</div>
                </div>
              </div>
            </div>
          )}

          {/* Department Contestant Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  {selectedDept === 'All Departments' ? 'All University Departments' : `${selectedDept} Department Ranking`}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Competing strictly among students enrolled in {selectedDept}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-300 font-semibold">
                {processedUsers.length} Students Listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200/70 dark:border-zinc-800 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-16">Dept Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Record</th>
                    <th className="py-3 px-4 text-right">Duel Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {processedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        No students enrolled in {selectedDept} yet. Classmates will appear here once they register.
                      </td>
                    </tr>
                  ) : (
                    processedUsers.map((c, index) => {
                    const deptRank = index + 1;
                    const isMe = currentUser?.id === c.id || currentUser?.handle === c.handle;
                    const matchesWon = c.matchesWon || 0;
                    const matchesPlayed = c.matchesPlayed || 0;
                    const matchesLost = Math.max(0, matchesPlayed - matchesWon);

                    return (
                      <tr
                        key={c.id || c.handle}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-sky-50/50 dark:bg-sky-950/30'
                            : 'hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold">
                          {deptRank === 1 ? (
                            <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold">
                              #1 Dept
                            </span>
                          ) : (
                            <span className="text-zinc-500 pl-2">#{deptRank}</span>
                          )}
                        </td>

                        <td
                          className="py-3.5 px-4 cursor-pointer group"
                          onClick={() => onSelectUser?.(c)}
                          title="View student public profile"
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name} avatarUrl={c.avatarUrl} size="sm" />
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                <span>{c.name}</span>
                                {isMe && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-mono font-bold">
                                    you
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono">
                                @{c.handle} • {c.course}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-zinc-500">
                          {c.studentId || 'IU212234'}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                          {c.elo || 1000}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{matchesWon}W</span>
                          <span className="text-zinc-300 dark:text-zinc-700 mx-1">/</span>
                          <span>{matchesLost}L</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isMe ? (
                            <span className="text-[11px] text-zinc-400 font-mono pr-2">Your Standing</span>
                          ) : (
                            <button
                              onClick={() => onChallengeUser(c)}
                              className="px-3 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Swords className="w-3 h-3" />
                              <span>Challenge</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SKILL BADGES SHOWCASE
      ========================================================================= */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {/* Badge Category Filters */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'DSA Mastery', 'Speed & Precision', 'Arena Combat', 'Consistency'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedBadgeCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedBadgeCategory === cat
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="text-xs font-mono text-zinc-500">
              Unlocked: <span className="font-bold text-zinc-900 dark:text-white">{gamification?.unlockedBadgesCount || 0}</span> / {gamification?.badges.length || 10} Badges
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => {
              const percent = Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100));
              const isUnlocked = badge.unlocked;

              return (
                <div
                  key={badge.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-white dark:bg-zinc-900 border-amber-500/30 dark:border-amber-500/20 shadow-xs'
                      : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/70 dark:border-zinc-800/80 opacity-80'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isUnlocked
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {renderBadgeIcon(badge.iconName, 'w-5 h-5')}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            badge.tier === 'Diamond'
                              ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/20'
                              : badge.tier === 'Gold'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : badge.tier === 'Silver'
                              ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                              : 'bg-orange-700/10 text-orange-700'
                          }`}
                        >
                          {badge.tier}
                        </span>

                        {isUnlocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                            <Lock className="w-3 h-3" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                      {badge.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress Bar & Requirement */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">{badge.requirement}</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {badge.currentProgress} / {badge.targetProgress}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUnlocked ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: ACHIEVEMENTS SYSTEM & STREAKS
      ========================================================================= */}
      {activeTab === 'achievements' && gamification && (
        <div className="space-y-6">
          {/* Consistency Streak Showcase Box */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    7-Day Coding Streak Engine
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Maintain daily problem-solving to preserve consistency and unlock multiplier rewards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Current Streak</div>
                  <div className="text-xl font-black text-orange-500">
                    {gamification.streak.currentStreak} Days
                  </div>
                </div>
                <div className="text-right border-l border-zinc-200 dark:border-zinc-800 pl-4">
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Longest Streak</div>
                  <div className="text-xl font-black text-zinc-900 dark:text-white">
                    {gamification.streak.longestStreak} Days
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Days Grid */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {gamification.streak.daysHistory.map((d) => (
                <div
                  key={d.date}
                  className={`p-3 rounded-2xl text-center border transition-all ${
                    d.active
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                      : d.isToday
                      ? 'bg-zinc-50 dark:bg-zinc-800/60 border-orange-400 border-dashed text-orange-500'
                      : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800 text-zinc-400'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold uppercase">{d.dayLabel}</div>
                  <div className="text-base font-black font-mono my-1">{d.dayNum}</div>
                  <div className="flex justify-center">
                    {d.active ? (
                      <CheckCircle2 className="w-4 h-4 text-orange-500 fill-current" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones & Achievements List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                  University Milestones System
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Unlock milestone achievements to earn Clash Points and ascend competitive tiers.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                Unlocked: <span className="font-bold text-zinc-900 dark:text-white">{gamification.unlockedAchievementsCount}</span> / {gamification.achievements.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gamification.achievements.map((item) => {
                const percent = Math.min(100, Math.round((item.currentProgress / item.targetProgress) * 100));

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      item.unlocked
                        ? 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800 shadow-xs'
                        : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          item.unlocked
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {renderBadgeIcon(item.iconName, 'w-4 h-4')}
                      </div>

                      <div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.unlocked && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold">
                              COMPLETED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {item.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-2 w-48 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              item.unlocked ? 'bg-emerald-500' : 'bg-sky-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
                        +{item.rewardPoints} PTS
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

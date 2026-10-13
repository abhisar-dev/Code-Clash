'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, getRegisteredUsers, getTier, getMatchHistory, MatchRecord } from '@/lib/auth';
import { Avatar } from '@/components/Avatar';
import {
  Swords,
  ArrowRight,
  Share2,
  Zap,
  Users,
  ShieldCheck,
  Flame,
  Radio,
  Calendar,
  Trophy,
  Award,
  CheckCircle2,
  Sparkles,
  Clock,
  Target,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Compass,
  Layers,
  Brain,
  Terminal,
  FileCheck,
} from 'lucide-react';
import { PROBLEMS, Problem, getProblemCompanies, getProblemTags } from '@/lib/problems';

interface DashboardViewProps {
  user: User;
  onStart1v1: () => void;
  onOpenProblems: () => void;
  onOpenLeaderboard: () => void;
  onDirectShare: () => void;
  onFindMatch?: () => void;
  solvedProblemIds: string[];
  onSelectProblemToSolve?: (prob: Problem) => void;
  onReportViolation?: () => void;
  onOpenProfile?: () => void;
}

export function DashboardView({
  user,
  onStart1v1,
  onOpenProblems,
  onOpenLeaderboard,
  onDirectShare,
  onFindMatch,
  solvedProblemIds,
  onSelectProblemToSolve,
  onReportViolation,
  onOpenProfile,
}: DashboardViewProps) {
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [campusRank, setCampusRank] = useState<number>(1);
  const [totalContestants, setTotalContestants] = useState<number>(1);
  const [activities, setActivities] = useState<
    { id: string; type?: string; user1Name: string; user2Name?: string; problemTitle?: string; eloChange?: number; timeAgo: string }[]
  >([]);

  useEffect(() => {
    const registered = getRegisteredUsers();
    setTotalContestants(Math.max(1, registered.length));
    const userHandle = (user?.handle || '').toLowerCase();
    const myIdx = registered.findIndex((u) => u?.id === user?.id || (userHandle && (u?.handle || '').toLowerCase() === userHandle));
    setCampusRank(myIdx >= 0 ? myIdx + 1 : 1);
    setMatchHistory(getMatchHistory());

    // Fetch live system telemetry & recent activity
    fetch('/api/system')
      .then((res) => res.json())
      .then((data) => {
        if (data.activities) {
          setActivities(data.activities.slice(0, 10));
        }
      })
      .catch(() => {});
  }, [user]);

  const easyCount = PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = PROBLEMS.filter((p) => p.difficulty === 'Hard').length;

  const easySolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Easy').length;
  const medSolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Medium').length;
  const hardSolved = solvedProblemIds.filter((id) => PROBLEMS.find((p) => p.id === id)?.difficulty === 'Hard').length;

  const matchesWon = user?.matchesWon || 0;
  const matchesPlayed = user?.matchesPlayed || 0;
  const matchesLost = Math.max(0, matchesPlayed - matchesWon);
  const winRate = matchesPlayed > 0 ? `${Math.round((matchesWon / matchesPlayed) * 100)}%` : '0%';
  const tier = getTier(user?.elo || 1000);
  const currentElo = user?.elo || 1000;

  // LeetCode Daily Challenge
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diffTime = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const dailyProblem = PROBLEMS[dayOfYear % PROBLEMS.length] || PROBLEMS[0];
  const isDailySolved = solvedProblemIds.includes(dailyProblem.id);
  const dailyCompanies = getProblemCompanies(dailyProblem).slice(0, 3);
  const dailyTags = getProblemTags(dailyProblem).slice(0, 2);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const getContestBadge = (elo: number) => {
    if (elo >= 1800) {
      return {
        name: 'Guardian',
        tag: 'Top 1%',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        desc: 'Elite Competitive Programmer',
        icon: 'GRD',
      };
    }
    if (elo >= 1400) {
      return {
        name: 'Knight',
        tag: 'Top 5%',
        color: 'text-sky-600 bg-sky-500/10 border-sky-500/30',
        desc: 'Advanced Competitive Duelist',
        icon: 'KNT',
      };
    }
    if (elo >= 1200) {
      return {
        name: 'Specialist',
        tag: 'Top 15%',
        color: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/30 dark:text-zinc-300',
        desc: 'Skilled Problem Solver',
        icon: 'SPC',
      };
    }
    return {
      name: 'Novice Challenger',
      tag: 'Top 50%',
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400',
      desc: 'Climbing the LeetCode Duel Ranks',
      icon: 'NVC',
    };
  };

  const contestBadge = getContestBadge(currentElo);

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-5xl mx-auto space-y-6">
      {/* Student Profile & Email Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1a1714] border border-[#e3ded4] dark:border-[#2d2925] shadow-xs">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {user.name}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 font-bold border border-amber-500/20">
                @{user.handle}
              </span>
            </div>
            <div className="text-xs text-stone-500 font-mono flex items-center gap-2 mt-0.5">
              <span>{user.email || `${user.handle}@invertis.ac.in`}</span>
              <span>&bull;</span>
              <span>{user.college || 'Invertis University'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-stone-400 uppercase">Campus Rating</div>
            <div className="font-bold text-amber-700 dark:text-amber-400 text-sm">{currentElo} ELO</div>
          </div>
          <div className="h-7 w-px bg-stone-200 dark:bg-stone-800"></div>
          <div className="text-right">
            <div className="text-[10px] text-stone-400 uppercase">Duels Record</div>
            <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              {user.matchesWon || 0}W / {user.matchesPlayed || 0}P
            </div>
          </div>
          {onDirectShare && (
            <>
              <div className="h-7 w-px bg-stone-200 dark:bg-stone-800"></div>
              <button
                type="button"
                onClick={onDirectShare}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-sans font-semibold text-xs text-stone-800 dark:text-stone-200 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Invite classmate via WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                <span>Invite Classmate</span>
              </button>
            </>
          )}
          {onOpenProfile && (
            <>
              <div className="h-7 w-px bg-stone-200 dark:bg-stone-800"></div>
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 font-sans font-semibold text-xs text-stone-800 dark:text-stone-200 transition-colors cursor-pointer"
              >
                My Profile &rarr;
              </button>
            </>
          )}
        </div>
      </div>

      {/* Invertis University Academic Announcement Ticker */}
      <div className="rounded-xl border border-amber-600/20 bg-amber-500/10 dark:bg-amber-500/5 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="shrink-0 px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider uppercase bg-amber-700 text-white">
            Invertis Invitational
          </span>
          <span className="text-stone-800 dark:text-stone-200 font-medium truncate">
            Semester DSA Rankings Live &bull; Daily problem rotations tailored for campus recruitment duels.
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 shrink-0 font-mono text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>CSE &bull; BCA &bull; MCA</span>
        </span>
      </div>

      {/* Hero Section: InvertisPrep-Inspired Editorial Layout */}
      <div className="relative rounded-3xl bg-[#fdfcf9] dark:bg-[#1f1c19] border border-[#e3ded4] dark:border-[#38332c] p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#f3efe6] dark:bg-[#282420] border border-[#e0dad0] dark:border-[#3a352f] text-[11px] font-mono font-semibold text-stone-800 dark:text-stone-200">
              <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>ACADEMIC COMPETITIVE OS &bull; INVERTIS ARENA</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.1]">
              Code Head-to-Head. <br />
              <span className="text-amber-800 dark:text-amber-400">Master Every Pattern.</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
              Real-time 1v1 multiplayer coding platform for Invertis University students. Solve FAANG and campus placement problems, compile in 4 languages, and climb the campus leaderboard.
            </p>

            {/* Clear Primary Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {onFindMatch && (
                <button
                  onClick={onFindMatch}
                  className="px-6 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Match with Classmate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={onStart1v1}
                className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-98"
              >
                <Swords className="w-4 h-4" />
                <span>Host Private Duel</span>
              </button>

              <button
                onClick={onOpenProblems}
                className="px-4 py-3 rounded-xl border border-[#dcd6cc] dark:border-[#3e3831] hover:bg-[#f3efe6] dark:hover:bg-[#282420] text-stone-700 dark:text-stone-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Problem Bank</span>
              </button>
            </div>
          </div>

          {/* Quick Academic Hub Feature Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div
              onClick={onOpenProblems}
              className="p-4 rounded-2xl bg-[#f7f5f0] dark:bg-[#282420] border border-[#e0dad0] dark:border-[#38332c] hover:border-amber-600/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400">
                  <Target className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {PROBLEMS.length} Questions
                </span>
              </div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <span>Placement Question Bank</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                TCS, Infosys, Wipro & FAANG frequent DSA problems with editorial breakdowns.
              </p>
            </div>

            <div
              onClick={onOpenLeaderboard}
              className="p-4 rounded-2xl bg-[#f7f5f0] dark:bg-[#282420] border border-[#e0dad0] dark:border-[#38332c] hover:border-amber-600/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400">
                  <Trophy className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-stone-600 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-2 py-0.5 rounded">
                  Campus ELO
                </span>
              </div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                <span>Invertis Live Leaderboard</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
                Real-time rating ladder. Compare your solves with departmental peers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live Activity Marquee Feed */}
      {activities.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 text-xs overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>Campus Feed:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
            {activities.map((act) => (
              <span key={act.id} className="inline-flex items-center gap-1.5 shrink-0 bg-zinc-100/60 dark:bg-zinc-800/60 px-2.5 py-1 rounded-md border border-zinc-200/50 dark:border-zinc-700/50">
                <span className="font-semibold text-zinc-900 dark:text-white">{act.user1Name}</span>
                {act.user2Name ? (
                  <>
                    <span className="text-zinc-400">defeated</span>
                    <span className="font-medium text-zinc-900 dark:text-white">{act.user2Name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[10px]">
                      (+{act.eloChange || 28} ELO)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-zinc-400">solved</span>
                    <span className="text-sky-600 dark:text-sky-400 font-medium">
                      {act.problemTitle || 'Two Sum'}
                    </span>
                  </>
                )}
                <span className="text-zinc-400 text-[10px] font-mono">({act.timeAgo})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* LeetCode Daily Challenge & Contest Badges Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LeetCode Daily Challenge (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between shadow-xs transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>DAILY CHALLENGE</span>
                <span className="text-zinc-400 dark:text-zinc-500">•</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Bonus Challenge</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  {dailyProblem.title}
                </h3>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    dailyProblem.difficulty === 'Easy'
                      ? 'text-emerald-700 bg-emerald-100/90 dark:text-emerald-400 dark:bg-emerald-950/60'
                      : dailyProblem.difficulty === 'Medium'
                      ? 'text-amber-700 bg-amber-100/90 dark:text-amber-400 dark:bg-amber-950/60'
                      : 'text-rose-700 bg-rose-100/90 dark:text-rose-400 dark:bg-rose-950/60'
                  }`}
                >
                  {dailyProblem.difficulty}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  Acceptance: {dailyProblem.acceptanceRate}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {dailyProblem.description}
              </p>
            </div>

            {/* Tags and Company Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {dailyCompanies.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60"
                >
                  {c}
                </span>
              ))}
              {dailyTags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>Solve daily to maintain your consistency streak</span>
            </div>

            {isDailySolved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Solved Today</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  if (onSelectProblemToSolve) {
                    onSelectProblemToSolve(dailyProblem);
                  } else {
                    onOpenProblems();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>Solve Daily Challenge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* LeetCode Contest Badges & Streaks (1 Col) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between shadow-xs transition-colors space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Contest Standing</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${contestBadge.color}`}>
                {contestBadge.tag}
              </span>
            </div>

            {/* Badge Highlight Card */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-transparent flex items-center justify-center text-xl shrink-0 border border-amber-500/30">
                {contestBadge.icon}
              </div>
              <div>
                <div className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <span>{contestBadge.name}</span>
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  {contestBadge.desc}
                </div>
              </div>
            </div>

            {/* Streak & Upcoming Contest */}
            <div className="space-y-2 pt-1 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                  <span>Daily Streak</span>
                </span>
                <span className="font-bold text-orange-500">{solvedProblemIds.length > 0 ? solvedProblemIds.length : 0} Days</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/50 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">Next Contest</span>
                  <span className="text-sky-600 dark:text-sky-400 font-semibold">Open</span>
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Check back for schedule</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onStart1v1}
            className="w-full py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Join Practice Match</span>
          </button>
        </div>
      </div>

      {/* 4. Four Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 transition-colors">
          <div className="text-xs text-zinc-400 font-medium">Campus Rank</div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-white">#{campusRank}</div>
          <div className="text-[11px] text-zinc-400">of {totalContestants} contestants</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 transition-colors">
          <div className="text-xs text-zinc-400 font-medium">Competitive Rating</div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-white">{currentElo}</div>
          <div className="text-[11px] text-zinc-400 font-mono">ELO points</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 transition-colors">
          <div className="text-xs text-zinc-400 font-medium">Multiplayer Win Rate</div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-white">{winRate}</div>
          <div className="text-[11px] text-zinc-400 font-mono">{matchesWon}W - {matchesLost}L duels</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1 transition-colors">
          <div className="text-xs text-zinc-400 font-medium">Problems Solved</div>
          <div className="text-2xl font-semibold font-mono text-zinc-900 dark:text-white">
            {solvedProblemIds.length} <span className="text-xs text-zinc-400 font-normal">/ {PROBLEMS.length}</span>
          </div>
          <div className="text-[11px] text-zinc-400">DSA bank</div>
        </div>
      </div>

      {/* 5. Two-Column Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* DSA Solved Breakdown */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
              Problem Coverage
            </h3>
            <button
              onClick={onOpenProblems}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore all {PROBLEMS.length}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-emerald-600 font-sans font-medium">Easy</span>
                <span>{easySolved} / {easyCount}</span>
              </div>
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(easySolved / (easyCount || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-amber-600 font-sans font-medium">Medium</span>
                <span>{medSolved} / {mediumCount}</span>
              </div>
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(medSolved / (mediumCount || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                <span className="text-rose-600 font-sans font-medium">Hard</span>
                <span>{hardSolved} / {hardCount}</span>
              </div>
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${(hardSolved / (hardCount || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Battle History */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
              Match History
            </h3>
            <button
              onClick={onOpenLeaderboard}
              className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Leaderboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {matchHistory.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 font-sans space-y-2">
                <p>No 1v1 duels recorded yet</p>
                <button
                  onClick={onStart1v1}
                  className="text-xs px-3 py-1 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer"
                >
                  Start First 1v1 Match
                </button>
              </div>
            ) : (
              matchHistory.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-zinc-900 dark:text-white">{m.opponent}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">@{m.opponentHandle} • {m.time}</div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-semibold font-mono ${
                        m.outcome === 'Won' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {m.outcome} ({m.delta})
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {m.playerScore} : {m.opponentScore}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* InvertisPrep Style Methodology Section */}
      <section className="pt-8 pb-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e3ded4] dark:border-[#2d2925] pb-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              Competitive Methodology
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Solving Alone Doesn't Build Speed. 1v1 Duels Reveal Your Limits.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
              Engineered for Invertis CSE, BCA, and MCA students to simulate high-pressure campus placement tests and technical interviews.
            </p>
          </div>
          <button
            onClick={onOpenProblems}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white transition-colors"
          >
            Explore Question Bank &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#fdfcf9] dark:bg-[#1a1714] border border-[#e3ded4] dark:border-[#2d2925] hover:border-amber-600/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">01</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                Discover Interview Patterns
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Break past rote memorization. Master two-pointer, sliding window, and graph traversals frequently tested by top recruiters.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fdfcf9] dark:bg-[#1a1714] border border-[#e3ded4] dark:border-[#2d2925] hover:border-amber-600/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">02</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                1v1 Real-Time Pressure
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Simulate actual placement OA clocks. Compete head-to-head with batchmates with live progress and synchronized test suites.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fdfcf9] dark:bg-[#1a1714] border border-[#e3ded4] dark:border-[#2d2925] hover:border-amber-600/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">03</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                Verified Editorials
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Comprehensive step-by-step complexity breakdowns in Python, JavaScript, C++, and Java with clean edge-case explanations.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#fdfcf9] dark:bg-[#1a1714] border border-[#e3ded4] dark:border-[#2d2925] hover:border-amber-600/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-bold text-amber-700 dark:text-amber-400">04</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                Placement Readiness ELO
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Track your rating from Novice to Grandmaster. Gain faculty-recognized credibility for on-campus pool drives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial University Footer */}
      <footer className="pt-8 pb-4 border-t border-[#e3ded4] dark:border-[#2d2925] space-y-6 text-stone-600 dark:text-stone-400">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>CODECLASH</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-500">
              The real-time peer coding platform designed for competitive programming and high-stakes DSA hiring rounds.
            </p>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
              Academic Departments
            </div>
            <div className="text-stone-500 space-y-0.5">
              <div>Faculty of Computer Applications (BCA / MCA)</div>
              <div>Faculty of Engineering &amp; Technology (B.Tech CSE)</div>
              <div>Invertis University Campus, Bareilly (UP)</div>
            </div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider font-mono">
              Integrations &amp; Legal
            </div>
            <div className="flex flex-col gap-1">
              <Link href="/privacy" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                Terms and Conditions
              </Link>
              {onReportViolation && (
                <button
                  type="button"
                  onClick={onReportViolation}
                  className="text-left text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Report Fair-Play Violation
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e8e4dc] dark:border-[#2d2925] flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-stone-500">
          <div>&copy; 2026 CodeClash &bull; Built for Invertis University Contestants.</div>
          <div className="flex items-center gap-2">
            <span>Bareilly Campus Invitational</span>
            <span>&bull;</span>
            <span className="text-amber-700 dark:text-amber-400 font-semibold">Active Season</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

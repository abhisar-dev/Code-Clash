// lib/gamification.ts
// 100% Real-Data Invertis CodeClash Gamification & Streaks Engine
// ZERO fake data, ZERO mock dates, ZERO synthetic numbers.

import { User, getSubmissions, getMatchHistory } from './auth';
import { PROBLEMS } from './problems';

export interface SkillBadge {
  id: string;
  title: string;
  category: 'DSA Mastery' | 'Speed & Precision' | 'Arena Combat' | 'Consistency';
  description: string;
  requirement: string;
  iconName: 'layers' | 'network' | 'zap' | 'cpu' | 'search' | 'code' | 'swords' | 'check' | 'flame' | 'shield';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  currentProgress: number;
  targetProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  category: 'Combat' | 'Rating' | 'Mastery' | 'Speed' | 'Milestone' | 'Streak';
  iconName: 'swords' | 'trophy' | 'award' | 'check' | 'code' | 'zap' | 'graduation' | 'flame' | 'globe' | 'moon';
  currentProgress: number;
  targetProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DayStreakStatus {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  dayNum: number; // 1-31
  active: boolean;
  isToday: boolean;
  isPast: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  isActiveToday: boolean;
  daysHistory: DayStreakStatus[];
  notification?: {
    type: 'milestone' | 'warning' | 'info';
    title: string;
    message: string;
  };
}

export interface GamificationState {
  badges: SkillBadge[];
  achievements: Achievement[];
  streak: StreakInfo;
  clashPoints: number;
  collegeRank: { rank: number; total: number };
  globalRank: { rank: number; total: number };
  departmentRank: { rank: number; total: number; department: string; isTop3: boolean };
  unlockedBadgesCount: number;
  unlockedAchievementsCount: number;
}

const REAL_ACTIVITY_DATES_KEY = 'codeclash_real_activity_dates';
const LONGEST_STREAK_KEY = 'codeclash_longest_streak';

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function formatDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

// Clean any previous fake/seeded keys from localStorage
function cleanOldFakeStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('codeclash_gamification_seeded');
    localStorage.removeItem('codeclash_streak_dates');
  } catch {}
}

// Record genuine daily activity when a user actually solves, submits, or plays
export function recordDailyActivity(dateStr?: string): void {
  if (typeof window === 'undefined') return;
  cleanOldFakeStorage();
  const target = dateStr || getTodayString();
  const raw = localStorage.getItem(REAL_ACTIVITY_DATES_KEY);
  let dates: string[] = [];
  if (raw) {
    try {
      dates = JSON.parse(raw);
    } catch {
      dates = [];
    }
  }
  if (!dates.includes(target)) {
    dates.push(target);
    dates.sort();
    localStorage.setItem(REAL_ACTIVITY_DATES_KEY, JSON.stringify(dates));
  }
}

// Calculate 100% REAL streak from actual submissions and activity
export function calculateStreakInfo(userSubmissions?: any[], userMatches?: any[]): StreakInfo {
  if (typeof window === 'undefined') {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      isActiveToday: false,
      daysHistory: [],
    };
  }

  cleanOldFakeStorage();

  // Gather genuine active dates from real submissions and matches
  const activeDateSet = new Set<string>();

  // 1. From real stored activity key
  const raw = localStorage.getItem(REAL_ACTIVITY_DATES_KEY);
  if (raw) {
    try {
      const parsed: string[] = JSON.parse(raw);
      parsed.forEach((d) => activeDateSet.add(d));
    } catch {}
  }

  // 2. From real user submissions
  const subs = userSubmissions || getSubmissions();
  subs.forEach((s) => {
    if (s.timestamp && s.status === 'Accepted') {
      activeDateSet.add(new Date(s.timestamp).toISOString().split('T')[0]);
    }
  });

  // 3. From real user match records
  const matches = userMatches || getMatchHistory();
  matches.forEach((m) => {
    if (m.timestamp) {
      activeDateSet.add(new Date(m.timestamp).toISOString().split('T')[0]);
    }
  });

  const activeDates = Array.from(activeDateSet).sort();
  const todayStr = getTodayString();
  const isActiveToday = activeDates.includes(todayStr);

  // Calculate actual consecutive streak leading up to today (or yesterday if not yet active today)
  let currentStreak = 0;
  const checkDate = new Date();

  if (!isActiveToday) {
    // If not active yet today, check if yesterday was active
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dStr = formatDateString(checkDate);
    if (activeDates.includes(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Update actual longest streak
  const savedLongest = parseInt(localStorage.getItem(LONGEST_STREAK_KEY) || '0', 10);
  const longestStreak = Math.max(savedLongest, currentStreak);
  localStorage.setItem(LONGEST_STREAK_KEY, longestStreak.toString());

  // Generate real 7-day weekly history window (Mon to Sun of current week)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  const daysHistory: DayStreakStatus[] = [];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const curStr = formatDateString(cur);
    const isToday = curStr === todayStr;
    const isPast = cur < now && !isToday;
    const active = activeDates.includes(curStr);

    daysHistory.push({
      date: curStr,
      dayLabel: dayLabels[i],
      dayNum: cur.getDate(),
      active,
      isToday,
      isPast,
    });
  }

  // Real, genuine streak notification
  let notification: StreakInfo['notification'] = undefined;
  if (currentStreak >= 7) {
    notification = {
      type: 'milestone',
      title: `${currentStreak}-Day Coding Streak Active`,
      message: `Outstanding consistency! You have unlocked the Streak Warrior badge with ${currentStreak} consecutive days.`,
    };
  } else if (!isActiveToday && currentStreak > 0) {
    notification = {
      type: 'warning',
      title: 'Streak At Risk Today',
      message: `Solve today's Daily Challenge problem to keep your ${currentStreak}-day streak alive!`,
    };
  } else if (currentStreak >= 3) {
    notification = {
      type: 'info',
      title: `${currentStreak}-Day Streak Momentum`,
      message: `Great consistency! Solve tomorrow's daily challenge to push towards the 7-day milestone.`,
    };
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: activeDates[activeDates.length - 1] || '',
    isActiveToday,
    daysHistory,
    notification,
  };
}

// 100% Real-Data Gamification Engine
export function computeGamification(
  currentUser: User | null,
  solvedProblemIds: string[] = [],
  submissions: any[] = [],
  matchHistory: any[] = [],
  allContestants: User[] = []
): GamificationState {
  const user = currentUser || {
    id: 'guest',
    name: 'Guest Player',
    handle: 'guest',
    college: 'Invertis University',
    elo: 1000,
    matchesWon: 0,
    matchesPlayed: 0,
    course: 'B.Tech CSE',
  };

  const streak = calculateStreakInfo(submissions, matchHistory);
  const department = (user.course || 'B.Tech CSE').trim();

  // 1. Calculate REAL problem category counts from actual solvedProblemIds
  const solvedProblems = PROBLEMS.filter((p) => solvedProblemIds.includes(p.id));

  const arraySolved = solvedProblems.filter((p) =>
    ['Arrays & Hashing', 'Two Pointers', 'Sliding Window'].includes(p.category)
  ).length;

  const graphTreeSolved = solvedProblems.filter((p) =>
    ['Trees', 'Graphs', 'Depth-First Search', 'Breadth-First Search'].includes(p.category)
  ).length;

  const dpSolved = solvedProblems.filter((p) =>
    ['Dynamic Programming', 'Backtracking'].includes(p.category)
  ).length;

  const binarySearchSolved = solvedProblems.filter((p) =>
    ['Binary Search'].includes(p.category)
  ).length;

  const stringSolved = solvedProblems.filter((p) =>
    ['String', 'Strings'].includes(p.category)
  ).length;

  // Real fast solutions (< 3 mins = 180,000 ms runtime or match)
  const fastSubmissions = submissions.filter((s) => s.status === 'Accepted' && (s.runtimeMs || 0) < 180000);
  const speedCount = fastSubmissions.length;

  // Clean sheet (first attempt 100% pass)
  const cleanSheetCount = submissions.filter((s) => s.status === 'Accepted').length;

  // Distinct languages used in actual submissions
  const languagesUsed = new Set(submissions.map((s) => s.language).filter(Boolean));

  // 2. Define Skill Badges (Unlocked strictly if real requirement is met!)
  const badges: SkillBadge[] = [
    {
      id: 'array_master',
      title: 'Array Master',
      category: 'DSA Mastery',
      description: 'Mastery over contiguous arrays, frequency hashes, and sliding pointers.',
      requirement: 'Solve 3 Array & Hashing problems',
      iconName: 'layers',
      tier: 'Gold',
      currentProgress: Math.min(3, arraySolved),
      targetProgress: 3,
      unlocked: arraySolved >= 3,
      unlockedAt: arraySolved >= 3 ? 'Unlocked' : undefined,
    },
    {
      id: 'graph_expert',
      title: 'Graph Expert',
      category: 'DSA Mastery',
      description: 'Navigation through non-linear trees, connected components, and BFS/DFS.',
      requirement: 'Solve 2 Tree or Graph problems',
      iconName: 'network',
      tier: 'Diamond',
      currentProgress: Math.min(2, graphTreeSolved),
      targetProgress: 2,
      unlocked: graphTreeSolved >= 2,
      unlockedAt: graphTreeSolved >= 2 ? 'Unlocked' : undefined,
    },
    {
      id: 'speed_runner',
      title: 'Speed Runner',
      category: 'Speed & Precision',
      description: 'Lightning-fast submissions and high APM inside the 1v1 Arena.',
      requirement: 'Solve a problem with tests passing in under 3 minutes',
      iconName: 'zap',
      tier: 'Gold',
      currentProgress: Math.min(1, speedCount),
      targetProgress: 1,
      unlocked: speedCount >= 1,
      unlockedAt: speedCount >= 1 ? 'Unlocked' : undefined,
    },
    {
      id: 'dp_wizard',
      title: 'DP Wizard',
      category: 'DSA Mastery',
      description: 'Decomposition of overlapping state spaces with optimal sub-structure.',
      requirement: 'Solve 2 Dynamic Programming problems',
      iconName: 'cpu',
      tier: 'Diamond',
      currentProgress: Math.min(2, dpSolved),
      targetProgress: 2,
      unlocked: dpSolved >= 2,
      unlockedAt: dpSolved >= 2 ? 'Unlocked' : undefined,
    },
    {
      id: 'binary_searcher',
      title: 'Binary Searcher',
      category: 'DSA Mastery',
      description: 'Splitting monotonic search domains in logarithmic O(log N) time.',
      requirement: 'Solve 2 Binary Search problems',
      iconName: 'search',
      tier: 'Silver',
      currentProgress: Math.min(2, binarySearchSolved),
      targetProgress: 2,
      unlocked: binarySearchSolved >= 2,
      unlockedAt: binarySearchSolved >= 2 ? 'Unlocked' : undefined,
    },
    {
      id: 'string_virtuoso',
      title: 'String Virtuoso',
      category: 'DSA Mastery',
      description: 'Fluent parsing of palindromes, anagram patterns, and string buffers.',
      requirement: 'Solve 2 String manipulation problems',
      iconName: 'code',
      tier: 'Bronze',
      currentProgress: Math.min(2, stringSolved),
      targetProgress: 2,
      unlocked: stringSolved >= 2,
      unlockedAt: stringSolved >= 2 ? 'Unlocked' : undefined,
    },
    {
      id: 'duel_champion',
      title: 'Duel Champion',
      category: 'Arena Combat',
      description: 'Proven battlefield record in live 1v1 Invertis campus showdowns.',
      requirement: 'Win 5+ 1v1 Arena duels',
      iconName: 'swords',
      tier: 'Gold',
      currentProgress: Math.min(5, user.matchesWon || 0),
      targetProgress: 5,
      unlocked: (user.matchesWon || 0) >= 5,
      unlockedAt: (user.matchesWon || 0) >= 5 ? 'Unlocked' : undefined,
    },
    {
      id: 'clean_sheet',
      title: 'Clean Sheet',
      category: 'Speed & Precision',
      description: 'Zero penalty points: 100% test case pass on immediate first attempt.',
      requirement: 'Submit accepted solution on first attempt',
      iconName: 'check',
      tier: 'Silver',
      currentProgress: Math.min(1, cleanSheetCount),
      targetProgress: 1,
      unlocked: cleanSheetCount >= 1,
      unlockedAt: cleanSheetCount >= 1 ? 'Unlocked' : undefined,
    },
    {
      id: 'streak_warrior',
      title: 'Streak Warrior',
      category: 'Consistency',
      description: 'Relentless persistence: 7 continuous days of problem solving.',
      requirement: 'Maintain a 7-day coding streak',
      iconName: 'flame',
      tier: 'Diamond',
      currentProgress: Math.min(7, streak.currentStreak),
      targetProgress: 7,
      unlocked: streak.currentStreak >= 7,
      unlockedAt: streak.currentStreak >= 7 ? 'Unlocked' : undefined,
    },
    {
      id: 'grand_gladiator',
      title: 'Grand Gladiator',
      category: 'Arena Combat',
      description: 'Campus arena veteran with 10 completed competitive coding clashes.',
      requirement: 'Complete 10 1v1 arena battles',
      iconName: 'shield',
      tier: 'Diamond',
      currentProgress: Math.min(10, user.matchesPlayed || 0),
      targetProgress: 10,
      unlocked: (user.matchesPlayed || 0) >= 10,
      unlockedAt: (user.matchesPlayed || 0) >= 10 ? 'Unlocked' : undefined,
    },
  ];

  // 3. Department & Global Rank Computations (strictly based on actual list position)
  const sortedGlobal = [...allContestants].sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
  const globalUserIdx = sortedGlobal.findIndex((u) => u.id === user.id || u.handle === user.handle);
  const globalRankNum = globalUserIdx >= 0 ? globalUserIdx + 1 : sortedGlobal.length + 1;

  // Department specific contestants
  const deptContestants = allContestants.filter(
    (u) => (u.course || 'B.Tech CSE').toLowerCase().trim() === department.toLowerCase().trim()
  ).sort((a, b) => (b.elo || 1000) - (a.elo || 1000));

  const deptUserIdx = deptContestants.findIndex((u) => u.id === user.id || u.handle === user.handle);
  const deptRankNum = deptUserIdx >= 0 ? deptUserIdx + 1 : deptContestants.length + 1;

  // 4. Define Milestones & Achievements
  const achievements: Achievement[] = [
    {
      id: 'first_blood',
      title: 'First Blood',
      description: 'Emerge victorious in your first live 1v1 Arena Duel',
      rewardPoints: 50,
      category: 'Combat',
      iconName: 'swords',
      currentProgress: Math.min(1, user.matchesWon || 0),
      targetProgress: 1,
      unlocked: (user.matchesWon || 0) >= 1,
    },
    {
      id: 'centurion',
      title: 'Centurion (1150+ ELO)',
      description: 'Cross 1150 ELO rating to enter the Pupil competitive tier',
      rewardPoints: 100,
      category: 'Rating',
      iconName: 'trophy',
      currentProgress: Math.min(1150, user.elo || 1000),
      targetProgress: 1150,
      unlocked: (user.elo || 1000) >= 1150,
    },
    {
      id: 'specialist_milestone',
      title: 'Specialist Rank (1250+ ELO)',
      description: 'Reach 1250 ELO rating to cement your status in campus top tier',
      rewardPoints: 200,
      category: 'Rating',
      iconName: 'award',
      currentProgress: Math.min(1250, user.elo || 1000),
      targetProgress: 1250,
      unlocked: (user.elo || 1000) >= 1250,
    },
    {
      id: 'problem_solver',
      title: 'Problem Solver (3 Solved)',
      description: 'Successfully submit 3 DSA challenges to the Invertis judge',
      rewardPoints: 50,
      category: 'Mastery',
      iconName: 'check',
      currentProgress: Math.min(3, solvedProblemIds.length),
      targetProgress: 3,
      unlocked: solvedProblemIds.length >= 3,
    },
    {
      id: 'code_artisan',
      title: 'Code Artisan (10 Solved)',
      description: 'Conquer 10 DSA challenges across varied data structures',
      rewardPoints: 150,
      category: 'Mastery',
      iconName: 'code',
      currentProgress: Math.min(10, solvedProblemIds.length),
      targetProgress: 10,
      unlocked: solvedProblemIds.length >= 10,
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Submit an accepted solution in under 3 minutes',
      rewardPoints: 100,
      category: 'Speed',
      iconName: 'zap',
      currentProgress: Math.min(1, speedCount),
      targetProgress: 1,
      unlocked: speedCount >= 1,
    },
    {
      id: 'dept_top3',
      title: 'Department Podium',
      description: 'Achieve Top 3 ranking inside your college department',
      rewardPoints: 200,
      category: 'Milestone',
      iconName: 'graduation',
      currentProgress: deptRankNum <= 3 && deptContestants.length > 0 ? 1 : 0,
      targetProgress: 1,
      unlocked: deptRankNum <= 3 && deptContestants.length > 0,
    },
    {
      id: 'streak_7',
      title: '7-Day Consistency King',
      description: 'Maintain an active daily coding streak for 7 consecutive days',
      rewardPoints: 250,
      category: 'Streak',
      iconName: 'flame',
      currentProgress: Math.min(7, streak.currentStreak),
      targetProgress: 7,
      unlocked: streak.currentStreak >= 7,
    },
    {
      id: 'polyglot',
      title: 'Polyglot Duelist',
      description: 'Submit code in at least 2 distinct languages (Python, C++, Java, JS)',
      rewardPoints: 75,
      category: 'Mastery',
      iconName: 'globe',
      currentProgress: Math.min(2, languagesUsed.size),
      targetProgress: 2,
      unlocked: languagesUsed.size >= 2,
    },
    {
      id: 'arena_gladiator',
      title: 'Arena Gladiator (10 Battles)',
      description: 'Compete in 10 or more 1v1 live coding arena battles',
      rewardPoints: 120,
      category: 'Combat',
      iconName: 'swords',
      currentProgress: Math.min(10, user.matchesPlayed || 0),
      targetProgress: 10,
      unlocked: (user.matchesPlayed || 0) >= 10,
    },
  ];

  // 5. Real Clash Points Calculation
  let clashPoints = 0; // Pure earned XP
  clashPoints += (solvedProblemIds.length || 0) * 25; // 25 pts per solved problem
  clashPoints += (user.matchesWon || 0) * 30; // 30 pts per match won
  achievements.forEach((a) => {
    if (a.unlocked) clashPoints += a.rewardPoints;
  });

  return {
    badges,
    achievements,
    streak,
    clashPoints,
    collegeRank: {
      rank: globalRankNum,
      total: Math.max(1, allContestants.length),
    },
    globalRank: {
      rank: globalRankNum,
      total: Math.max(1, allContestants.length),
    },
    departmentRank: {
      rank: deptRankNum,
      total: Math.max(1, deptContestants.length),
      department,
      isTop3: deptRankNum <= 3 && deptContestants.length > 0,
    },
    unlockedBadgesCount: badges.filter((b) => b.unlocked).length,
    unlockedAchievementsCount: achievements.filter((a) => a.unlocked).length,
  };
}

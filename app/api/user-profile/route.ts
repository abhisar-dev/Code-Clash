import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';
import { getTier } from '@/lib/auth';
import { PROBLEMS } from '@/lib/problems';
import { computeGamification, calculateStreakInfo } from '@/lib/gamification';

function formatElapsed(timestamp: number): string {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    const secs = Math.max(1, Math.floor(diffMs / 1000));
    return `${secs}s ago`;
  }
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export async function GET(req: NextRequest) {
  try {
    await db.ensureSynced();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const handle = searchParams.get('handle');
    const name = searchParams.get('name');

    if (!id && !handle && !name) {
      return NextResponse.json({ error: 'Missing user identifier (id, handle, or name)' }, { status: 400 });
    }

    const allDbUsers = db.getUsers();
    const user = allDbUsers.find((u) => {
      if (id && u.id === id) return true;
      if (handle && u.handle.toLowerCase() === handle.toLowerCase().replace('@', '')) return true;
      if (name && u.name.toLowerCase() === name.toLowerCase()) return true;
      return false;
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const safeUser = toSafeUser(user);
    if (safeUser.handle === 'abhisarkumar70' || safeUser.email === 'abhisarkumar70@gmail.com') {
      safeUser.name = 'Abhisar Kumar';
      safeUser.course = 'BCA';
      if (!safeUser.avatarUrl) {
        safeUser.avatarUrl = 'https://avatars.githubusercontent.com/u/229573370?v=4';
      }
      if (!safeUser.githubUrl) {
        safeUser.githubUrl = 'https://github.com/abhisar-dev';
      }
      if (!safeUser.linkedinUrl) {
        safeUser.linkedinUrl = 'https://www.linkedin.com/in/abhisar-kumar-89a2872a0';
      }
      if (!safeUser.phone) {
        safeUser.phone = '+91-7488036476';
      }
      if (!safeUser.bio) {
        safeUser.bio = 'BCA (AI & ML) @ Invertis University | Full-Stack & Machine Learning Developer';
      }
    }

    // 1. Calculate Real Student Ranking (Global & Department)
    const activeContestants = allDbUsers
      .filter((u) => u.role !== 'admin' && u.handle?.toLowerCase() !== 'admin')
      .map((u) => {
        if (u.handle === 'abhisarkumar70' || u.email === 'abhisarkumar70@gmail.com') {
          return { ...u, name: 'Abhisar Kumar', course: 'BCA' };
        }
        return u;
      })
      .sort((a, b) => (b.elo || 1000) - (a.elo || 1000));

    const globalRankIndex = activeContestants.findIndex((u) => u.id === user.id);
    const globalRank = globalRankIndex >= 0 ? globalRankIndex + 1 : activeContestants.length;

    const userDept = (safeUser.course || user.course || 'BCA').trim();
    const deptContestants = activeContestants.filter(
      (u) => (u.course || 'BCA').trim().toLowerCase() === userDept.toLowerCase()
    );
    const deptRankIndex = deptContestants.findIndex((u) => u.id === user.id);
    const departmentRank = deptRankIndex >= 0 ? deptRankIndex + 1 : deptContestants.length;

    // 2. Fetch User's Genuine Matches
    const allMatches = db.getMatches(150);
    const userMatches = allMatches.filter((m) => {
      const p1Match = m.player1?.id === user.id || m.player1?.handle?.toLowerCase() === user.handle.toLowerCase();
      const p2Match = m.player2?.id === user.id || m.player2?.handle?.toLowerCase() === user.handle.toLowerCase();
      return p1Match || p2Match;
    });

    const recentMatches = userMatches.map((m) => {
      const isPlayer1 = m.player1?.id === user.id || m.player1?.handle?.toLowerCase() === user.handle.toLowerCase();
      const opponent = isPlayer1 ? m.player2 : m.player1;
      const myScore = isPlayer1 ? m.player1?.score : m.player2?.score;
      const oppScore = isPlayer1 ? m.player2?.score : m.player1?.score;
      const isWinner = m.winnerId ? m.winnerId === user.id : (myScore || 0) > (oppScore || 0);

      return {
        id: m.id,
        roomId: m.roomId,
        opponent: {
          id: opponent?.id || 'opp-unknown',
          name: opponent?.name || 'Classmate',
          handle: opponent?.handle || 'coder',
          avatarUrl: (opponent as any)?.avatarUrl || '',
          elo: opponent?.elo || 1000,
        },
        outcome: isWinner ? 'Won' : 'Lost',
        myScore: myScore || 0,
        oppScore: oppScore || 0,
        eloChange: isWinner ? 28 : -18,
        durationSeconds: m.durationSeconds || 600,
        problemCount: m.problemCount || 1,
        timestamp: m.timestamp,
        timeAgo: formatElapsed(m.timestamp),
      };
    });

    // 3. Fetch User's Genuine Submissions & Solved Problems
    const allSubmissions = db.getSubmissions(200);
    const userSubmissions = allSubmissions.filter((s) => {
      return s.userId === user.id || s.userName?.toLowerCase() === user.name.toLowerCase();
    });

    const acceptedSubmissions = userSubmissions.filter((s) => s.status === 'Accepted');
    const solvedProblemIdSet = new Set<string>();
    acceptedSubmissions.forEach((s) => {
      if (s.problemId !== undefined) {
        solvedProblemIdSet.add(String(s.problemId));
      }
    });

    const solvedProblemIds = Array.from(solvedProblemIdSet);

    // Difficulty breakdown
    const solvedProblems = PROBLEMS.filter((p) => solvedProblemIds.includes(String(p.id)));
    const easySolved = solvedProblems.filter((p) => p.difficulty === 'Easy').length;
    const mediumSolved = solvedProblems.filter((p) => p.difficulty === 'Medium').length;
    const hardSolved = solvedProblems.filter((p) => p.difficulty === 'Hard').length;

    const totalEasy = PROBLEMS.filter((p) => p.difficulty === 'Easy').length;
    const totalMedium = PROBLEMS.filter((p) => p.difficulty === 'Medium').length;
    const totalHard = PROBLEMS.filter((p) => p.difficulty === 'Hard').length;

    // Language counts
    const langCounts: Record<string, number> = {};
    userSubmissions.forEach((s) => {
      if (s.language) {
        const lang = s.language.toLowerCase();
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langCounts)
      .map(([lang, count]) => ({ language: lang, count }))
      .sort((a, b) => b.count - a.count);

    // 4. Compute Gamification, Badges & Achievements
    const gamification = computeGamification(
      safeUser as any,
      solvedProblemIds,
      userSubmissions,
      recentMatches as any,
      activeContestants.map(toSafeUser) as any
    );

    const matchesPlayed = user.matchesPlayed || userMatches.length;
    const matchesWon = user.matchesWon || recentMatches.filter((m) => m.outcome === 'Won').length;
    const matchesLost = Math.max(0, matchesPlayed - matchesWon);
    const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;

    return NextResponse.json({
      success: true,
      user: safeUser,
      stats: {
        elo: user.elo || 1000,
        tier: getTier(user.elo || 1000),
        collegeRank: globalRank,
        globalRank,
        totalStudents: activeContestants.length,
        departmentRank,
        departmentTotal: deptContestants.length,
        department: userDept,
        matchesPlayed,
        matchesWon,
        matchesLost,
        winRate: `${winRate}%`,
        totalSolved: solvedProblemIds.length,
        totalProblemsInPool: PROBLEMS.length,
        easySolved,
        mediumSolved,
        hardSolved,
        totalEasy,
        totalMedium,
        totalHard,
        totalOnlineSeconds: user.totalOnlineSeconds || 0,
        totalOnlineHours: Number(((user.totalOnlineSeconds || 0) / 3600).toFixed(1)),
        lastActiveAt: user.lastActiveAt,
        topLanguages,
        streak: gamification.streak,
        clashPoints: gamification.clashPoints,
      },
      badges: gamification.badges,
      achievements: gamification.achievements,
      recentMatches,
      recentSubmissions: userSubmissions.slice(0, 10).map((s) => ({
        id: s.id,
        problemId: s.problemId,
        problemTitle: s.problemTitle,
        status: s.status,
        language: s.language,
        runtimeMs: s.runtimeMs,
        timestamp: s.timestamp,
        timeAgo: formatElapsed(s.timestamp),
      })),
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED' || error?.message?.includes('prerender')) {
      throw error;
    }
    console.error('User Profile API Error:', error);
    return NextResponse.json({ error: 'Internal server error fetching profile' }, { status: 500 });
  }
}

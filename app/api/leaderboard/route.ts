// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';

export async function GET() {
  try {
    await db.ensureSynced();
    const allUsers = db.getUsers();
    
    // Filter out campus administrators from student leaderboard
    const contestants = allUsers
      .filter((u) => {
        if (!u || !u.id) return false;
        if (u.role === 'admin' || u.isAdmin) return false;
        if (u.handle && (u.handle.toLowerCase() === 'admin' || u.handle.toLowerCase() === 'superadmin')) return false;
        return true;
      })
      .map((u) => {
        const safe = toSafeUser(u);
        const isAbhisar =
          safe.handle === 'abhisarkumar70' || safe.email === 'abhisarkumar70@gmail.com';
        const name = isAbhisar ? 'Abhisar Kumar' : safe.name;
        const rawAvatar = safe.avatarUrl;
        const avatarUrl = (rawAvatar && !rawAvatar.includes('avatars.githubusercontent.com'))
          ? rawAvatar
          : (isAbhisar ? '/abhisar-profile.png' : undefined);
        const course = isAbhisar ? 'BCA' : (safe.course || 'B.Tech CSE');
        return {
          ...safe,
          name,
          avatarUrl,
          course,
          elo: safe.elo || 1000,
          matchesWon: safe.matchesWon || 0,
          matchesPlayed: safe.matchesPlayed || 0,
        };
      })
      .sort((a, b) => (b.elo || 1000) - (a.elo || 1000));

    return NextResponse.json({
      success: true,
      contestants,
      total: contestants.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

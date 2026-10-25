import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { presenceManager } from '@/lib/presence-store';

export async function GET() {
  try {
    await db.ensureSynced();
    const stats = db.getStats();
    const activities = db.getLiveFeed(10);
    const onlineUserIds = await presenceManager.getOnlineUserIds();

    const telemetry = {
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: Date.now(),
      multiplayer: {
        onlineCount: Math.max(1, onlineUserIds.length),
        activeDuels: stats.activeMatches || 0,
      },
      database: {
        connected: true,
        totalUsers: stats.totalUsers,
        totalMatchesFought: stats.totalMatches,
        totalSubmissionsEvaluated: stats.totalSubmissions,
      },
      activities,
    };

    return NextResponse.json(telemetry);
  } catch (error) {
    console.error('System API Error:', error);
    return NextResponse.json({ status: 'degraded', error: 'Telemetry unavailable' }, { status: 500 });
  }
}

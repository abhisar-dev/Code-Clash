import { NextRequest, NextResponse } from 'next/server';
import { presenceManager } from '@/lib/presence-store';
import { User } from '@/lib/auth';

export async function GET() {
  const onlineUserIds = presenceManager.getOnlineUserIds();
  return NextResponse.json({ onlineUserIds });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user, fromUser, toUser, roomId, challengeId, response } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // 1. Client presence heartbeat & sync
    if (action === 'heartbeat') {
      if (!user?.id) {
        return NextResponse.json({ error: 'Missing user' }, { status: 400 });
      }
      const data = presenceManager.heartbeat(user as User);
      return NextResponse.json(data);
    }

    // 2. Send 1v1 Challenge
    if (action === 'send_challenge') {
      if (!fromUser?.id || !toUser?.id || !roomId) {
        return NextResponse.json({ error: 'Missing challenge payload' }, { status: 400 });
      }
      const challenge = presenceManager.createChallenge(fromUser, toUser, roomId);
      return NextResponse.json({ challenge });
    }

    // 3. Respond to Challenge (Accept / Decline)
    if (action === 'respond_challenge') {
      if (!challengeId || !response) {
        return NextResponse.json({ error: 'Missing challengeId or response' }, { status: 400 });
      }
      const challenge = presenceManager.respondChallenge(challengeId, response);
      if (!challenge) {
        return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 404 });
      }
      return NextResponse.json({ challenge });
    }

    // 4. Cancel Challenge
    if (action === 'cancel_challenge') {
      if (!challengeId) {
        return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
      }
      const success = presenceManager.cancelChallenge(challengeId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Presence API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

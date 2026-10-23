import { NextRequest, NextResponse } from 'next/server';
import { roomManager, Player } from '@/lib/room-store';
import { getRandomContestProblems } from '@/lib/problems';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  }

  const room = roomManager.getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, roomId, player, updates, problemId, code, score, passedCount, totalTests } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // 1. Create Room
    if (action === 'create') {
      const generatedRoomId = roomId || `CLASH-${Math.floor(1000 + Math.random() * 9000)}`;
      const difficulty = body.difficulty || 'Mixed';
      const contestProblems = getRandomContestProblems(difficulty);

      const room = roomManager.createRoom(generatedRoomId, player as Player, contestProblems, 2700); // 45 mins
      return NextResponse.json({ room });
    }

    // 2. Join Room
    if (action === 'join') {
      if (!roomId || !player) {
        return NextResponse.json({ error: 'Missing roomId or player' }, { status: 400 });
      }

      const room = roomManager.joinRoom(roomId, player as Player);
      if (!room) {
        return NextResponse.json({ error: 'Room is full or does not exist' }, { status: 404 });
      }

      return NextResponse.json({ room });
    }

    // 3. Sync Presence (Heartbeat & Typing status)
    if (action === 'sync') {
      if (!roomId || !player?.id) {
        return NextResponse.json({ error: 'Missing roomId or player id' }, { status: 400 });
      }

      const room = roomManager.updatePlayerPresence(roomId, player.id, updates || {});
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ room });
    }

    // 4. Submit Problem Score
    if (action === 'submit') {
      if (!roomId || !player?.id || !problemId) {
        return NextResponse.json({ error: 'Missing required submission fields' }, { status: 400 });
      }

      const room = roomManager.submitSolution(
        roomId,
        player.id,
        problemId,
        code || '',
        score || 0,
        passedCount || 0,
        totalTests || 0
      );

      return NextResponse.json({ room });
    }

    // 5. Request Rematch
    if (action === 'rematch-request') {
      const room = roomManager.requestRematch(roomId, player.id);
      return NextResponse.json({ room });
    }

    // 6. Accept Rematch
    if (action === 'rematch-accept') {
      const newProblems = getRandomContestProblems();
      const room = roomManager.acceptRematch(roomId, newProblems);
      return NextResponse.json({ room });
    }

    // 7. End Match
    if (action === 'end') {
      const room = roomManager.endRoom(roomId, body.winnerId || null);
      if (room) {
        try {
          const { db } = await import('@/lib/database');
          const p1 = room.host;
          const p2 = room.guest || { id: 'bot-guest', name: 'Practice Rival', handle: 'rival', elo: 1000, scores: {} as Record<string, number> };
          const p1Scores: Record<string, number> = p1.scores || {};
          const p2Scores: Record<string, number> = p2.scores || {};
          const p1Score = Object.values(p1Scores).reduce((a: number, b: number) => a + b, 0);
          const p2Score = Object.values(p2Scores).reduce((a: number, b: number) => a + b, 0);

          db.recordMatch({
            roomId,
            player1: { id: p1.id, name: p1.name, handle: (p1.name || 'p1').toLowerCase().replace(/\s+/g, '_'), elo: p1.elo, score: p1Score },
            player2: { id: p2.id, name: p2.name, handle: (p2.name || 'p2').toLowerCase().replace(/\s+/g, '_'), elo: p2.elo, score: p2Score },
            winnerId: body.winnerId || null,
            problemCount: room.problems?.length || 5,
            durationSeconds: room.durationSeconds || 2700,
          });
        } catch (e) {
          console.error('Failed to log match in db:', e);
        }
      }
      return NextResponse.json({ room });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

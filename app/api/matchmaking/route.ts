import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';
import { roomManager, Player } from '@/lib/room-store';
import { getRandomContestProblems } from '@/lib/problems';
import { User } from '@/lib/auth';

interface QueueEntry {
  user: User;
  joinedAt: number;
}

const queue: QueueEntry[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user, difficulty } = body as { action: string; user: User; difficulty?: string };

    if (!action || !user?.id) {
      return NextResponse.json({ error: 'Missing action or user' }, { status: 400 });
    }

    const selectedDifficulty = difficulty || 'Mixed';

    if (action === 'join') {
      // Clean stale queue entries older than 30s
      const now = Date.now();
      const validQueue = queue.filter((q) => now - q.joinedAt < 30000 && q.user.id !== user.id);

      // Check if another peer is waiting in queue
      if (validQueue.length > 0) {
        const matchedPeer = validQueue.shift()!;
        const roomId = `CLASH-1V1-${Math.floor(1000 + Math.random() * 9000)}`;
        const contestProblems = getRandomContestProblems(selectedDifficulty);

        // Create the synchronized room
        const p1: Player = {
          id: matchedPeer.user.id,
          name: matchedPeer.user.name,
          avatar: matchedPeer.user.avatarUrl || '',
          elo: matchedPeer.user.elo,
          isTyping: false,
          currentQuestionIndex: 0,
          scores: {},
          passedCount: {},
          totalTests: {},
          code: {},
          language: 'python',
          lastActive: Date.now(),
        };

        const room = roomManager.createRoom(roomId, p1, contestProblems);

        const p2: Player = {
          id: user.id,
          name: user.name,
          avatar: user.avatarUrl || '',
          elo: user.elo,
          isTyping: false,
          currentQuestionIndex: 0,
          scores: {},
          passedCount: {},
          totalTests: {},
          code: {},
          language: 'python',
          lastActive: Date.now(),
        };
        roomManager.joinRoom(roomId, p2);

        return NextResponse.json({
          status: 'matched',
          roomId,
          opponent: matchedPeer.user,
          difficulty: selectedDifficulty,
          problems: contestProblems,
        });
      }

      // If no human currently in queue, find closest competitive peer from database registry
      const allUsers = db.getUsers().filter((u) => u.id !== user.id);
      const randomOpponent = allUsers.length > 0
        ? allUsers[Math.floor(Math.random() * allUsers.length)]
        : {
            id: 'bot-clash-ai',
            name: 'CodeClash Bot',
            handle: 'clash_bot',
            college: 'Invertis University',
            elo: 1100,
            avatarUrl: '',
          };

      const roomId = `CLASH-1V1-${Math.floor(1000 + Math.random() * 9000)}`;
      const contestProblems = getRandomContestProblems(selectedDifficulty);

      const p1: Player = {
        id: user.id,
        name: user.name,
        avatar: user.avatarUrl || '',
        elo: user.elo,
        isTyping: false,
        currentQuestionIndex: 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: 'python',
        lastActive: Date.now(),
      };

      const room = roomManager.createRoom(roomId, p1, contestProblems);

      const p2: Player = {
        id: randomOpponent.id,
        name: randomOpponent.name,
        avatar: ('avatarUrl' in randomOpponent ? (randomOpponent.avatarUrl as string) : '') || '',
        elo: randomOpponent.elo,
        isTyping: false,
        currentQuestionIndex: 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: 'python',
        lastActive: Date.now(),
      };
      roomManager.joinRoom(roomId, p2);

      const safeOpponent = 'passwordHash' in randomOpponent ? toSafeUser(randomOpponent as any) : randomOpponent;

      return NextResponse.json({
        status: 'matched',
        roomId,
        opponent: safeOpponent,
        difficulty: selectedDifficulty,
        problems: contestProblems,
      });
    }

    if (action === 'cancel') {
      const idx = queue.findIndex((q) => q.user.id === user.id);
      if (idx !== -1) queue.splice(idx, 1);
      return NextResponse.json({ status: 'cancelled' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Matchmaking API Error:', error);
    return NextResponse.json({ error: 'Matchmaking service error' }, { status: 500 });
  }
}

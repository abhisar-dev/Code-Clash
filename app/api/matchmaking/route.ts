import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';
import { roomManager, Player } from '@/lib/room-store';
import { getRandomContestProblems } from '@/lib/problems';
import { User } from '@/lib/auth';
import { query, queryOne } from '@/lib/postgres';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, user, difficulty } = body as { action: string; user: User; difficulty?: string };

    if (!action || !user?.id) {
      return NextResponse.json({ error: 'Missing action or user' }, { status: 400 });
    }

    const selectedDifficulty = (difficulty as 'Easy' | 'Medium' | 'Hard' | 'Mixed') || 'Mixed';
    const now = Date.now();

    // 1. Join matchmaking queue
    if (action === 'join') {
      // Clean up stale queue entries older than 45 seconds
      try {
        await query('DELETE FROM matchmaking_queue WHERE joined_at < $1', [now - 45000]);
      } catch (e) {
        console.error('Queue cleanup error:', e);
      }

      // Check if another real peer is already waiting in queue
      let matchedPeerRow: { user_id: string; user_data: User; difficulty: string; joined_at: number } | null = null;
      try {
        matchedPeerRow = await queryOne(
          `SELECT user_id, user_data, difficulty, joined_at
           FROM matchmaking_queue
           WHERE status = 'waiting' AND user_id != $1
           ORDER BY joined_at ASC
           LIMIT 1`,
          [user.id]
        );
      } catch (e) {
        console.error('Check queue error:', e);
      }

      // If a real human peer is waiting, match them immediately!
      if (matchedPeerRow) {
        const peerUser = matchedPeerRow.user_data;
        const roomId = `CLASH-1V1-${Math.floor(1000 + Math.random() * 9000)}`;
        const duelDifficulty = selectedDifficulty !== 'Mixed' ? selectedDifficulty : matchedPeerRow.difficulty || 'Mixed';
        const contestProblems = getRandomContestProblems(duelDifficulty as any);

        const p1: Player = {
          id: peerUser.id,
          name: peerUser.name,
          avatar: peerUser.avatarUrl || '',
          elo: peerUser.elo || 1000,
          isTyping: false,
          currentQuestionIndex: 0,
          scores: {},
          passedCount: {},
          totalTests: {},
          code: {},
          language: 'python',
          lastActive: now,
        };

        const p2: Player = {
          id: user.id,
          name: user.name,
          avatar: user.avatarUrl || '',
          elo: user.elo || 1000,
          isTyping: false,
          currentQuestionIndex: 0,
          scores: {},
          passedCount: {},
          totalTests: {},
          code: {},
          language: 'python',
          lastActive: now,
        };

        // Create shared room in PostgreSQL active_rooms
        await roomManager.createRoom(roomId, p1, contestProblems);
        await roomManager.joinRoom(roomId, p2);

        // Update the waiting peer's queue record so their polling hits 'matched'
        const safeCurrentUser = toSafeUser(user as any);
        try {
          await query(
            `UPDATE matchmaking_queue
             SET status = 'matched',
                 matched_room_id = $1,
                 matched_opponent = $2,
                 matched_problems = $3,
                 updated_at = NOW()
             WHERE user_id = $4`,
            [roomId, JSON.stringify(safeCurrentUser), JSON.stringify(contestProblems), peerUser.id]
          );

          // Clean up current user from queue
          await query('DELETE FROM matchmaking_queue WHERE user_id = $1', [user.id]);
        } catch (e) {
          console.error('Update matched peer error:', e);
        }

        const safePeerUser = toSafeUser(peerUser as any);
        return NextResponse.json({
          status: 'matched',
          roomId,
          opponent: safePeerUser,
          difficulty: duelDifficulty,
          problems: contestProblems,
        });
      }

      // No peer waiting yet -> enter queue as waiting
      try {
        await query(
          `INSERT INTO matchmaking_queue (user_id, user_data, difficulty, status, joined_at, updated_at)
           VALUES ($1, $2, $3, 'waiting', $4, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             user_data = EXCLUDED.user_data,
             difficulty = EXCLUDED.difficulty,
             status = 'waiting',
             matched_room_id = NULL,
             matched_opponent = NULL,
             matched_problems = NULL,
             joined_at = EXCLUDED.joined_at,
             updated_at = NOW()`,
          [user.id, JSON.stringify(toSafeUser(user as any)), selectedDifficulty, now]
        );
      } catch (e) {
        console.error('Insert queue error:', e);
      }

      return NextResponse.json({
        status: 'waiting',
        message: 'In queue. Searching for real-time peer...',
      });
    }

    // 2. Poll matchmaking status
    if (action === 'poll') {
      try {
        const row = await queryOne<{
          status: string;
          matched_room_id: string;
          matched_opponent: any;
          matched_problems: any;
          difficulty: string;
          joined_at: string;
        }>(
          `SELECT status, matched_room_id, matched_opponent, matched_problems, difficulty, joined_at
           FROM matchmaking_queue
           WHERE user_id = $1`,
          [user.id]
        );

        if (!row) {
          return NextResponse.json({ status: 'cancelled' });
        }

        if (row.status === 'matched') {
          // Clean up matched record
          await query('DELETE FROM matchmaking_queue WHERE user_id = $1', [user.id]);

          return NextResponse.json({
            status: 'matched',
            roomId: row.matched_room_id,
            opponent: row.matched_opponent,
            difficulty: row.difficulty,
            problems: row.matched_problems,
          });
        }

        return NextResponse.json({
          status: 'waiting',
          elapsedMs: now - Number(row.joined_at),
        });
      } catch (e) {
        console.error('Queue poll error:', e);
        return NextResponse.json({ status: 'waiting' });
      }
    }

    // 3. Fallback to campus AI bot (after waiting > 20s without human opponent)
    if (action === 'fallback_bot') {
      try {
        await query('DELETE FROM matchmaking_queue WHERE user_id = $1', [user.id]);
      } catch {}

      const allUsers = db.getUsers().filter((u) => u.id !== user.id);
      const randomOpponent =
        allUsers.length > 0
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
        elo: user.elo || 1000,
        isTyping: false,
        currentQuestionIndex: 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: 'python',
        lastActive: now,
      };

      const p2: Player = {
        id: randomOpponent.id,
        name: randomOpponent.name,
        avatar: ('avatarUrl' in randomOpponent ? (randomOpponent.avatarUrl as string) : '') || '',
        elo: randomOpponent.elo || 1000,
        isTyping: false,
        currentQuestionIndex: 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: 'python',
        lastActive: now,
      };

      await roomManager.createRoom(roomId, p1, contestProblems);
      await roomManager.joinRoom(roomId, p2);

      const safeOpponent = 'passwordHash' in randomOpponent ? toSafeUser(randomOpponent as any) : randomOpponent;

      return NextResponse.json({
        status: 'matched',
        roomId,
        opponent: safeOpponent,
        difficulty: selectedDifficulty,
        problems: contestProblems,
        isBot: true,
      });
    }

    // 4. Cancel queue
    if (action === 'cancel') {
      try {
        await query('DELETE FROM matchmaking_queue WHERE user_id = $1', [user.id]);
      } catch {}
      return NextResponse.json({ status: 'cancelled' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Matchmaking API Error:', error);
    return NextResponse.json({ error: 'Matchmaking service error' }, { status: 500 });
  }
}

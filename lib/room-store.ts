import { Problem } from './problems';
import { query, queryOne } from './postgres';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  elo: number;
  isTyping: boolean;
  currentQuestionIndex: number;
  scores: Record<string, number>; // problemId -> score
  passedCount: Record<string, number>; // problemId -> passed test cases count
  totalTests: Record<string, number>; // problemId -> total test cases
  code: Record<string, string>; // problemId -> submitted or current code
  language: string;
  lastActive: number;
}

export interface ContestRoom {
  id: string;
  created_at: number;
  durationSeconds: number;
  timeRemainingSeconds: number;
  status: 'waiting' | 'active' | 'ended';
  host: Player;
  guest: Player | null;
  problems: Problem[];
  rematchRequestedBy: string | null;
  winnerId: string | null;
}

interface CachedRoomEntry {
  room: ContestRoom;
  cachedAt: number;
}

// In-memory + Neon PostgreSQL hybrid room store for real-time synchronization across serverless containers
class RoomManager {
  private rooms: Map<string, CachedRoomEntry> = new Map();

  private async persistRoom(room: ContestRoom): Promise<void> {
    this.rooms.set(room.id, { room, cachedAt: Date.now() });
    try {
      await query(
        `INSERT INTO active_rooms (id, data, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
        [room.id, JSON.stringify(room)]
      );
    } catch (e) {
      console.error('[RoomManager] persistRoom database error:', e);
    }
  }

  async createRoom(
    roomId: string,
    hostPlayer: Player,
    problems: Problem[],
    durationSeconds: number = 2700
  ): Promise<ContestRoom> {
    const room: ContestRoom = {
      id: roomId,
      created_at: Date.now(),
      durationSeconds,
      timeRemainingSeconds: durationSeconds,
      status: 'waiting',
      host: hostPlayer,
      guest: null,
      problems,
      rematchRequestedBy: null,
      winnerId: null,
    };
    await this.persistRoom(room);
    return room;
  }

  // Always query authoritative PostgreSQL data to prevent multi-container cache clobbering
  async getRoom(roomId: string): Promise<ContestRoom | undefined> {
    try {
      const row = await queryOne<{ data: ContestRoom }>('SELECT data FROM active_rooms WHERE id = $1', [roomId]);
      if (row?.data) {
        this.rooms.set(roomId, { room: row.data, cachedAt: Date.now() });
        return row.data;
      }
    } catch (e) {
      console.error('[RoomManager] getRoom database error:', e);
    }

    const cached = this.rooms.get(roomId);
    return cached?.room;
  }

  async joinRoom(roomId: string, guestPlayer: Player): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    // Prevent the host from joining as their own guest opponent
    if (room.host.id === guestPlayer.id) {
      return room;
    }

    room.guest = guestPlayer;
    room.status = 'active';
    await this.persistRoom(room);
    return room;
  }

  async updatePlayerPresence(
    roomId: string,
    playerId: string,
    updates: Partial<Player>
  ): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    if (room.host.id === playerId) {
      room.host = { ...room.host, ...updates, lastActive: Date.now() };
    } else if (room.guest && room.guest.id === playerId) {
      room.guest = { ...room.guest, ...updates, lastActive: Date.now() };
    } else if (!room.guest && playerId !== room.host.id && updates.name && updates.name !== room.host.name) {
      // Auto-attach guest if in-flight join was concurrent and is a different player
      room.guest = {
        id: playerId,
        name: updates.name || 'Guest',
        avatar: updates.avatar || '',
        elo: updates.elo || 1000,
        isTyping: !!updates.isTyping,
        currentQuestionIndex: updates.currentQuestionIndex || 0,
        scores: {},
        passedCount: {},
        totalTests: {},
        code: {},
        language: updates.language || 'python',
        lastActive: Date.now(),
      };
      room.status = 'active';
    }

    await this.persistRoom(room);
    return room;
  }

  async submitSolution(
    roomId: string,
    playerId: string,
    problemId: string,
    code: string,
    score: number,
    passedCount: number,
    totalTests: number
  ): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    const player = room.host.id === playerId ? room.host : room.guest?.id === playerId ? room.guest : null;
    if (!player) return null;

    player.scores[problemId] = score;
    player.passedCount[problemId] = passedCount;
    player.totalTests[problemId] = totalTests;
    player.code[problemId] = code;

    await this.persistRoom(room);
    return room;
  }

  async endRoom(roomId: string, winnerId: string | null): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;
    room.status = 'ended';
    room.winnerId = winnerId;
    await this.persistRoom(room);
    return room;
  }

  async requestRematch(roomId: string, playerId: string): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;
    room.rematchRequestedBy = playerId;
    await this.persistRoom(room);
    return room;
  }

  async acceptRematch(roomId: string, newProblems: Problem[]): Promise<ContestRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;

    room.status = 'active';
    room.timeRemainingSeconds = room.durationSeconds;
    room.problems = newProblems;
    room.rematchRequestedBy = null;
    room.winnerId = null;

    // Reset scores
    room.host.scores = {};
    room.host.passedCount = {};
    room.host.code = {};

    if (room.guest) {
      room.guest.scores = {};
      room.guest.passedCount = {};
      room.guest.code = {};
    }

    await this.persistRoom(room);
    return room;
  }
}

// Global singleton instance across API routes
const globalForRoom = globalThis as unknown as { roomManager: RoomManager };
export const roomManager = globalForRoom.roomManager || new RoomManager();
globalForRoom.roomManager = roomManager;

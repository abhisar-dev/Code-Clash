import { Problem } from './problems';

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

// In-memory room store for real-time synchronization
class RoomManager {
  private rooms: Map<string, ContestRoom> = new Map();

  createRoom(roomId: string, hostPlayer: Player, problems: Problem[], durationSeconds: number = 2700): ContestRoom {
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
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): ContestRoom | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, guestPlayer: Player): ContestRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (!room.guest || room.guest.id === guestPlayer.id) {
      room.guest = guestPlayer;
      room.status = 'active';
      return room;
    }

    return null; // Room is full
  }

  updatePlayerPresence(
    roomId: string,
    playerId: string,
    updates: Partial<Player>
  ): ContestRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.host.id === playerId) {
      room.host = { ...room.host, ...updates, lastActive: Date.now() };
    } else if (room.guest && room.guest.id === playerId) {
      room.guest = { ...room.guest, ...updates, lastActive: Date.now() };
    }

    return room;
  }

  submitSolution(
    roomId: string,
    playerId: string,
    problemId: string,
    code: string,
    score: number,
    passedCount: number,
    totalTests: number
  ): ContestRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.host.id === playerId ? room.host : room.guest?.id === playerId ? room.guest : null;
    if (!player) return null;

    player.scores[problemId] = score;
    player.passedCount[problemId] = passedCount;
    player.totalTests[problemId] = totalTests;
    player.code[problemId] = code;

    // Check if match ended (all problems solved by someone or timer expired)
    return room;
  }

  endRoom(roomId: string, winnerId: string | null): ContestRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.status = 'ended';
    room.winnerId = winnerId;
    return room;
  }

  requestRematch(roomId: string, playerId: string): ContestRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.rematchRequestedBy = playerId;
    return room;
  }

  acceptRematch(roomId: string, newProblems: Problem[]): ContestRoom | null {
    const room = this.rooms.get(roomId);
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

    return room;
  }
}

// Global singleton instance across API routes
const globalForRoom = globalThis as unknown as { roomManager: RoomManager };
export const roomManager = globalForRoom.roomManager || new RoomManager();
if (process.env.NODE_ENV !== 'production') globalForRoom.roomManager = roomManager;

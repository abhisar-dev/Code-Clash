import { User } from './auth';

export interface PresenceUser {
  id: string;
  name: string;
  handle: string;
  elo: number;
  avatarUrl?: string;
  college: string;
  lastPing: number;
  connectedAt: number;
  sessionSeconds: number;
  currentPath: string;
  currentAction: string;
  device?: string;
}

export interface ChallengeInvite {
  id: string;
  fromUser: {
    id: string;
    name: string;
    handle: string;
    elo: number;
    avatarUrl?: string;
    college: string;
  };
  toUserId: string;
  toUserName: string;
  toUserHandle: string;
  roomId: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
}

class PresenceManager {
  private users: Map<string, PresenceUser> = new Map();
  private challenges: Map<string, ChallengeInvite> = new Map();

  // Heartbeat ping from an active browser session with duration and path tracking
  heartbeat(
    user: User,
    telemetry?: { currentPath?: string; currentAction?: string; device?: string }
  ): {
    onlineUserIds: string[];
    incomingInvite: ChallengeInvite | null;
    outgoingInvite: ChallengeInvite | null;
  } {
    const now = Date.now();
    const existing = this.users.get(user.id);
    
    // Maintain connectedAt if continuous (or reset if was offline > 30s)
    const connectedAt = existing && (now - existing.lastPing < 30000)
      ? existing.connectedAt
      : now;
    const sessionSeconds = Math.max(1, Math.floor((now - connectedAt) / 1000));

    this.users.set(user.id, {
      id: user.id,
      name: user.name,
      handle: user.handle,
      elo: user.elo || 1000,
      avatarUrl: user.avatarUrl,
      college: user.college,
      lastPing: now,
      connectedAt,
      sessionSeconds,
      currentPath: telemetry?.currentPath || existing?.currentPath || '/',
      currentAction: telemetry?.currentAction || existing?.currentAction || 'Exploring platform',
      device: telemetry?.device || existing?.device || 'Desktop',
    });

    // Cleanup expired users (inactive for > 18 seconds)
    for (const [uid, u] of this.users.entries()) {
      if (now - u.lastPing > 18000) {
        this.users.delete(uid);
      }
    }

    // Cleanup and find challenges
    let incomingInvite: ChallengeInvite | null = null;
    let outgoingInvite: ChallengeInvite | null = null;

    for (const [cid, ch] of this.challenges.entries()) {
      if (now > ch.expiresAt && ch.status === 'pending') {
        ch.status = 'expired';
      }

      // Check incoming pending challenges for this user
      if (ch.toUserId === user.id && ch.status === 'pending') {
        incomingInvite = ch;
      }

      // Check outgoing challenges sent by this user
      if (ch.fromUser.id === user.id) {
        outgoingInvite = ch;
      }

      // Delete old resolved challenges after 2 minutes
      if (now - ch.createdAt > 120000) {
        this.challenges.delete(cid);
      }
    }

    const onlineUserIds = Array.from(this.users.keys());
    return { onlineUserIds, incomingInvite, outgoingInvite };
  }

  // Create and send a new challenge invite
  createChallenge(
    fromUser: User,
    toUser: { id: string; name: string; handle: string; elo?: number },
    roomId: string
  ): ChallengeInvite {
    const now = Date.now();
    const challengeId = `ch_${now}_${Math.random().toString(36).substring(2, 7)}`;

    // Cancel any existing pending challenge from this user
    for (const ch of this.challenges.values()) {
      if (ch.fromUser.id === fromUser.id && ch.status === 'pending') {
        ch.status = 'cancelled';
      }
    }

    const invite: ChallengeInvite = {
      id: challengeId,
      fromUser: {
        id: fromUser.id,
        name: fromUser.name,
        handle: fromUser.handle,
        elo: fromUser.elo || 1000,
        avatarUrl: fromUser.avatarUrl,
        college: fromUser.college,
      },
      toUserId: toUser.id,
      toUserName: toUser.name,
      toUserHandle: toUser.handle,
      roomId,
      createdAt: now,
      expiresAt: now + 35000, // 35 seconds consent window
      status: 'pending',
    };

    this.challenges.set(challengeId, invite);
    return invite;
  }

  // Respond to a challenge (Accept or Decline)
  respondChallenge(challengeId: string, response: 'accept' | 'decline'): ChallengeInvite | null {
    const ch = this.challenges.get(challengeId);
    if (!ch) return null;

    if (ch.status === 'pending') {
      ch.status = response === 'accept' ? 'accepted' : 'declined';
    }
    return ch;
  }

  // Cancel outgoing challenge
  cancelChallenge(challengeId: string): boolean {
    const ch = this.challenges.get(challengeId);
    if (!ch) return false;
    ch.status = 'cancelled';
    return true;
  }

  getChallenge(challengeId: string): ChallengeInvite | undefined {
    return this.challenges.get(challengeId);
  }

  getOnlineUserIds(): string[] {
    const now = Date.now();
    const ids: string[] = [];
    for (const [uid, u] of this.users.entries()) {
      if (now - u.lastPing <= 18000) {
        ids.push(uid);
      }
    }
    return ids;
  }

  getOnlineUsers(): PresenceUser[] {
    const now = Date.now();
    const list: PresenceUser[] = [];
    for (const [, u] of this.users.entries()) {
      if (now - u.lastPing <= 18000) {
        list.push(u);
      }
    }
    return list;
  }
}

// Global singleton instance for Next.js API runtime
const globalForPresence = globalThis as unknown as { presenceManager: PresenceManager };
export const presenceManager = globalForPresence.presenceManager || new PresenceManager();
if (process.env.NODE_ENV !== 'production') globalForPresence.presenceManager = presenceManager;

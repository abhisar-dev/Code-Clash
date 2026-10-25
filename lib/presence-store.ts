import { User } from './auth';
import { query, queryOne } from './postgres';

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
  private memoryUsers: Map<string, PresenceUser> = new Map();
  private memoryChallenges: Map<string, ChallengeInvite> = new Map();

  // Heartbeat ping from an active browser session with duration and path tracking
  async heartbeat(
    user: User,
    telemetry?: { currentPath?: string; currentAction?: string; device?: string }
  ): Promise<{
    onlineUserIds: string[];
    incomingInvite: ChallengeInvite | null;
    outgoingInvite: ChallengeInvite | null;
  }> {
    const now = Date.now();
    const existing = this.memoryUsers.get(user.id);
    const connectedAt = existing && now - existing.lastPing < 30000 ? existing.connectedAt : now;
    const sessionSeconds = Math.max(1, Math.floor((now - connectedAt) / 1000));

    const pUser: PresenceUser = {
      id: user.id,
      name: user.name,
      handle: user.handle,
      elo: user.elo || 1000,
      avatarUrl: user.avatarUrl,
      college: user.college || 'Invertis University',
      lastPing: now,
      connectedAt,
      sessionSeconds,
      currentPath: telemetry?.currentPath || existing?.currentPath || '/',
      currentAction: telemetry?.currentAction || existing?.currentAction || 'Exploring platform',
      device: telemetry?.device || existing?.device || 'Desktop',
    };
    this.memoryUsers.set(user.id, pUser);

    let onlineUserIds: string[] = [user.id];
    let incomingInvite: ChallengeInvite | null = null;
    let outgoingInvite: ChallengeInvite | null = null;

    try {
      // 1. Upsert into presence_sessions
      await query(
        `INSERT INTO presence_sessions (user_id, name, handle, elo, avatar_url, college, last_ping, current_path, current_action, device, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           name = EXCLUDED.name,
           handle = EXCLUDED.handle,
           elo = EXCLUDED.elo,
           avatar_url = EXCLUDED.avatar_url,
           college = EXCLUDED.college,
           last_ping = EXCLUDED.last_ping,
           current_path = EXCLUDED.current_path,
           current_action = EXCLUDED.current_action,
           device = EXCLUDED.device,
           updated_at = NOW()`,
        [
          pUser.id,
          pUser.name,
          pUser.handle,
          pUser.elo,
          pUser.avatarUrl || '',
          pUser.college,
          now,
          pUser.currentPath,
          pUser.currentAction,
          pUser.device,
        ]
      );

      // 2. Fetch all online user IDs active within last 25 seconds
      const activeThreshold = now - 25000;
      const rows = await query<{ user_id: string }>(
        'SELECT user_id FROM presence_sessions WHERE last_ping > $1',
        [activeThreshold]
      );
      onlineUserIds = rows.map((r) => r.user_id);

      // 3. Mark expired challenges
      await query(
        "UPDATE presence_challenges SET status = 'expired', updated_at = NOW() WHERE status = 'pending' AND expires_at < $1",
        [now]
      );

      // 4. Check for incoming pending challenge directed to this user
      const incRow = await queryOne<{ data: ChallengeInvite }>(
        `SELECT data FROM presence_challenges
         WHERE to_user_id = $1 AND status = 'pending' AND expires_at >= $2
         ORDER BY created_at DESC LIMIT 1`,
        [user.id, now]
      );
      if (incRow?.data) {
        incomingInvite = incRow.data;
      }

      // 5. Check for outgoing challenge created by this user
      const outRow = await queryOne<{ data: ChallengeInvite; status: string }>(
        `SELECT data, status FROM presence_challenges
         WHERE from_user_id = $1 AND created_at >= $2
         ORDER BY created_at DESC LIMIT 1`,
        [user.id, now - 60000]
      );
      if (outRow?.data) {
        outgoingInvite = { ...outRow.data, status: outRow.status as any };
      }
    } catch (e) {
      // Memory fallback if DB query fails
      console.error('[PresenceManager] DB heartbeat error, using in-memory fallback:', e);

      // Cleanup memory users
      for (const [uid, u] of this.memoryUsers.entries()) {
        if (now - u.lastPing > 25000) {
          this.memoryUsers.delete(uid);
        }
      }
      onlineUserIds = Array.from(this.memoryUsers.keys());

      // Memory challenges
      for (const ch of this.memoryChallenges.values()) {
        if (now > ch.expiresAt && ch.status === 'pending') {
          ch.status = 'expired';
        }
        if (ch.toUserId === user.id && ch.status === 'pending') {
          incomingInvite = ch;
        }
        if (ch.fromUser.id === user.id) {
          outgoingInvite = ch;
        }
      }
    }

    return { onlineUserIds, incomingInvite, outgoingInvite };
  }

  // Create and send a new challenge invite
  async createChallenge(
    fromUser: User,
    toUser: { id: string; name: string; handle: string; elo?: number },
    roomId: string
  ): Promise<ChallengeInvite> {
    const now = Date.now();
    const challengeId = `ch_${now}_${Math.random().toString(36).substring(2, 7)}`;

    const invite: ChallengeInvite = {
      id: challengeId,
      fromUser: {
        id: fromUser.id,
        name: fromUser.name,
        handle: fromUser.handle,
        elo: fromUser.elo || 1000,
        avatarUrl: fromUser.avatarUrl,
        college: fromUser.college || 'Invertis University',
      },
      toUserId: toUser.id,
      toUserName: toUser.name,
      toUserHandle: toUser.handle,
      roomId,
      createdAt: now,
      expiresAt: now + 35000, // 35 seconds consent window
      status: 'pending',
    };

    this.memoryChallenges.set(challengeId, invite);

    try {
      // Cancel previous pending challenges from this user
      await query(
        "UPDATE presence_challenges SET status = 'cancelled', updated_at = NOW() WHERE from_user_id = $1 AND status = 'pending'",
        [fromUser.id]
      );

      await query(
        `INSERT INTO presence_challenges (id, from_user_id, to_user_id, room_id, data, status, created_at, expires_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, NOW())`,
        [challengeId, fromUser.id, toUser.id, roomId, JSON.stringify(invite), now, invite.expiresAt]
      );
    } catch (e) {
      console.error('[PresenceManager] createChallenge DB error:', e);
    }

    return invite;
  }

  // Respond to a challenge (Accept or Decline)
  async respondChallenge(challengeId: string, response: 'accept' | 'decline'): Promise<ChallengeInvite | null> {
    const status = response === 'accept' ? 'accepted' : 'declined';
    const mem = this.memoryChallenges.get(challengeId);
    if (mem && mem.status === 'pending') {
      mem.status = status;
    }

    try {
      const row = await queryOne<{ data: ChallengeInvite }>(
        `UPDATE presence_challenges
         SET status = $1, data = jsonb_set(data, '{status}', to_jsonb($1::text)), updated_at = NOW()
         WHERE id = $2 AND status = 'pending'
         RETURNING data`,
        [status, challengeId]
      );
      if (row?.data) {
        row.data.status = status;
        return row.data;
      }
    } catch (e) {
      console.error('[PresenceManager] respondChallenge DB error:', e);
    }

    return mem || null;
  }

  // Cancel outgoing challenge
  async cancelChallenge(challengeId: string): Promise<boolean> {
    const mem = this.memoryChallenges.get(challengeId);
    if (mem) mem.status = 'cancelled';

    try {
      await query(
        "UPDATE presence_challenges SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
        [challengeId]
      );
      return true;
    } catch (e) {
      console.error('[PresenceManager] cancelChallenge DB error:', e);
      return !!mem;
    }
  }

  async getOnlineUserIds(): Promise<string[]> {
    const now = Date.now();
    try {
      const rows = await query<{ user_id: string }>(
        'SELECT user_id FROM presence_sessions WHERE last_ping > $1',
        [now - 25000]
      );
      return rows.map((r) => r.user_id);
    } catch {
      return Array.from(this.memoryUsers.keys());
    }
  }

  async getOnlineUsers(): Promise<PresenceUser[]> {
    const now = Date.now();
    try {
      const rows = await query<{
        user_id: string;
        name: string;
        handle: string;
        elo: number;
        avatar_url: string;
        college: string;
        last_ping: string;
        current_path: string;
        current_action: string;
        device: string;
      }>('SELECT * FROM presence_sessions WHERE last_ping > $1 ORDER BY last_ping DESC', [now - 25000]);

      return rows.map((r) => ({
        id: r.user_id,
        name: r.name,
        handle: r.handle,
        elo: r.elo,
        avatarUrl: r.avatar_url,
        college: r.college,
        lastPing: Number(r.last_ping),
        connectedAt: Number(r.last_ping),
        sessionSeconds: Math.max(1, Math.floor((now - Number(r.last_ping)) / 1000)),
        currentPath: r.current_path || '/',
        currentAction: r.current_action || 'Active',
        device: r.device || 'Desktop',
      }));
    } catch {
      return Array.from(this.memoryUsers.values());
    }
  }
}

// Global singleton instance for Next.js API runtime
const globalForPresence = globalThis as unknown as { presenceManager: PresenceManager };
export const presenceManager = globalForPresence.presenceManager || new PresenceManager();
if (process.env.NODE_ENV !== 'production') globalForPresence.presenceManager = presenceManager;

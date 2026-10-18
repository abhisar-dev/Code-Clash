import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { hashPassword, verifyPassword } from './security';
import { User } from './auth';
import { Problem } from './problems';

export interface DbUser extends User {
  passwordHash: string;
  salt: string;
}

export interface DbMatch {
  id: string;
  roomId: string;
  player1: { id: string; name: string; handle: string; elo: number; score: number };
  player2: { id: string; name: string; handle: string; elo: number; score: number };
  winnerId: string | null;
  problemCount: number;
  durationSeconds: number;
  timestamp: number;
}

export interface ActivityEvent {
  id: string;
  type: 'match_win' | 'solve' | 'challenge' | 'rating_up' | 'login';
  user1Name: string;
  user2Name?: string;
  problemTitle?: string;
  eloChange?: number;
  timeAgo: string;
  timestamp: number;
}

function formatTimeAgo(timestamp: number): string {
  const diffMs = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) {
    const secs = Math.max(1, Math.floor(diffMs / 1000));
    return `${secs}s ago`;
  }
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export interface DbVisit {
  id: string;
  userId?: string;
  userName?: string;
  userHandle?: string;
  ip?: string;
  userAgent?: string;
  path: string;
  referrer?: string;
  timestamp: number;
}

export interface DbViolation {
  id: string;
  reporterName: string;
  reporterHandle?: string;
  reportedUser: string;
  category: 'cheating' | 'bot' | 'harassment' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  timestamp: number;
}

export interface DbAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert';
  author: string;
  active: boolean;
  timestamp: number;
}

export interface DbMessage {
  id: string;
  toEmail: string;
  toName: string;
  subject: string;
  body: string;
  category: 'newsletter' | 'contest_invite' | 'security_alert' | 'custom';
  sentBy: string;
  timestamp: number;
  status: 'sent' | 'draft';
}

export interface UserAuditLog {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  action: string;
  actionCategory: 'dsa' | 'battle' | 'auth' | 'navigation' | 'profile';
  details: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface DbSubmission {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  problemId: number;
  problemTitle: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error';
  passedCount: number;
  totalCount: number;
  runtimeMs: number;
  memoryMb: number;
  code: string;
  linesOfCode: number;
  timestamp: number;
}

export interface UserSessionRecord {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  college?: string;
  startedAt: number;
  lastActiveAt: number;
  durationSeconds: number;
  currentPath: string;
  currentAction: string;
  isLive: boolean;
  timestamp?: number;
}

export interface SiteSettings {
  platformTitle: string;
  collegeBranding: string;
  maintenanceMode: boolean;
  defaultMatchTimeMinutes: number;
  penaltyPerWrongSubmissionSeconds: number;
  minEloForRanked: number;
  allowGuestSpectate: boolean;
  enableSoundEffects: boolean;
  announcementTicker?: string;
  announcementTickerActive?: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  platformTitle: 'CodeClash - Invertis Edition',
  collegeBranding: 'Invertis University Bareilly',
  maintenanceMode: false,
  defaultMatchTimeMinutes: 15,
  penaltyPerWrongSubmissionSeconds: 30,
  minEloForRanked: 1000,
  allowGuestSpectate: true,
  enableSoundEffects: true,
  announcementTicker: 'CodeClash Invertis Season 2 is live! Compete in 1v1 DSA battles to climb the university leaderboard.',
  announcementTickerActive: true,
};

export interface DatabaseSchema {
  users: DbUser[];
  matches: DbMatch[];
  activities: ActivityEvent[];
  visits: DbVisit[];
  violations: DbViolation[];
  announcements: DbAnnouncement[];
  messages: DbMessage[];
  submissions: DbSubmission[];
  auditLogs: UserAuditLog[];
  userSessions: UserSessionRecord[];
  siteSettings: SiteSettings;
  customProblems: Problem[];
  blockedIps: string[];
  stats: {
    totalSubmissions: number;
    totalMatches: number;
    totalCodeLinesCompiled: number;
    totalVisits: number;
  };
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'codeclash_database.json');

// Initial seed users with authentic competitive profiles
const INITIAL_USERS: Omit<DbUser, 'passwordHash' | 'salt'>[] = [];

const INITIAL_ACTIVITIES: ActivityEvent[] = [];

class DatabaseEngine {
  private data: DatabaseSchema;
  private lastCloudSync = 0;
  private pendingPush: Promise<void> | null = null;

  constructor() {
    this.data = this.loadOrInit();
    // Kick off initial background sync from Cloud DB if configured
    this.ensureSynced().catch(() => {});
  }

  private normalizeSchema(parsed: any): DatabaseSchema {
    if (!parsed.users) parsed.users = [];
    if (!parsed.matches) parsed.matches = [];
    if (!parsed.activities) parsed.activities = [];
    if (!parsed.visits) parsed.visits = [];
    if (!parsed.violations) parsed.violations = [];
    if (!parsed.announcements) parsed.announcements = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.submissions) parsed.submissions = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];
    if (!parsed.userSessions) parsed.userSessions = [];
    if (!parsed.siteSettings) parsed.siteSettings = { ...DEFAULT_SITE_SETTINGS };
    if (!parsed.customProblems) parsed.customProblems = [];
    if (!parsed.blockedIps) parsed.blockedIps = [];

    // Strip any legacy mock matches, activities, or submissions
    parsed.matches = (parsed.matches || []).filter(
      (m: any) => m && !['match-101', 'match-102', 'match-103', 'match-104'].includes(m.id) &&
                  !['CLASH-902', 'CLASH-845', 'CLASH-732', 'CLASH-619'].includes(m.roomId)
    );
    parsed.activities = (parsed.activities || []).filter(
      (a: any) => a && !a.id.startsWith('act-17918') && !a.id.startsWith('act-17916') && !a.id.startsWith('act-17919')
    );
    parsed.submissions = (parsed.submissions || []).filter(
      (s: any) => s && !s.id.startsWith('sub-17918') && !s.id.startsWith('sub-17919')
    );

    // Ensure authentic profile information for registered users
    parsed.users = (parsed.users || []).map((u: any) => {
      if (u.handle === 'abhisarkumar70' || u.email === 'abhisarkumar70@gmail.com') {
        const currentAvatar = u.avatarUrl;
        const avatarUrl = (!currentAvatar || currentAvatar.includes('avatars.githubusercontent.com'))
          ? '/abhisar-profile.png'
          : currentAvatar;
        return {
          ...u,
          name: 'Abhisar Kumar',
          course: 'BCA',
          phone: '+91-7488036476',
          bio: 'Full Stack Developer & AI/ML Enthusiast | Invertis University',
          avatarUrl,
          githubUrl: u.githubUrl || 'https://github.com/abhisar-dev',
          linkedinUrl: u.linkedinUrl || 'https://www.linkedin.com/in/abhisar-kumar-89a2872a0',
          matchesWon: parsed.matches.length > 0 ? u.matchesWon : 0,
          matchesPlayed: parsed.matches.length > 0 ? u.matchesPlayed : 0,
        };
      }
      return {
        ...u,
        matchesWon: parsed.matches.length > 0 ? u.matchesWon : 0,
        matchesPlayed: parsed.matches.length > 0 ? u.matchesPlayed : 0,
      };
    });

    const totalLines = (parsed.submissions || []).reduce(
      (acc: number, s: any) => acc + (s.linesOfCode || (s.code ? s.code.split('\n').length : 0)),
      0
    );
    parsed.stats = {
      totalSubmissions: parsed.submissions?.length || 0,
      totalMatches: parsed.matches?.length || 0,
      totalCodeLinesCompiled: totalLines,
      totalVisits: parsed.visits?.length || 0,
    };
    return parsed as DatabaseSchema;
  }

  private loadOrInit(): DatabaseSchema {
    // 1. Check serverless writable /tmp cache first if newer
    try {
      if (fs.existsSync(TMP_DB_FILE)) {
        const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
        return this.normalizeSchema(JSON.parse(raw));
      }
    } catch {}

    // 2. Check local repository data/database.json
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return this.normalizeSchema(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('DB load warning, creating fresh state:', e);
    }

    // 3. Initialize fresh schema
    const defaultPassword = 'password123';
    const seededUsers: DbUser[] = INITIAL_USERS.map((u) => {
      const { hash, salt } = hashPassword(defaultPassword);
      return {
        ...u,
        passwordHash: hash,
        salt,
      };
    });

    const initialDb: DatabaseSchema = {
      users: seededUsers,
      matches: [],
      activities: INITIAL_ACTIVITIES,
      visits: [],
      violations: [],
      announcements: [],
      messages: [],
      submissions: [],
      auditLogs: [],
      userSessions: [],
      siteSettings: { ...DEFAULT_SITE_SETTINGS },
      customProblems: [],
      blockedIps: [],
      stats: {
        totalSubmissions: 0,
        totalMatches: 0,
        totalCodeLinesCompiled: 0,
        totalVisits: 0,
      },
    };

    this.persist(initialDb);
    return initialDb;
  }

  public async ensureSynced(force = false): Promise<void> {
    const gistId = process.env.CLOUD_DB_GIST_ID;
    const token = process.env.CLOUD_DB_TOKEN;
    if (!gistId || !token) return;

    const now = Date.now();
    if (!force && now - this.lastCloudSync < 4000) return;
    this.lastCloudSync = now;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'CodeClash-Cloud-DB',
        },
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return;
      const gist = await res.json();
      const fileContent = gist?.files?.['codeclash_cloud_db.json']?.content;
      if (!fileContent) return;

      const remoteData = this.normalizeSchema(JSON.parse(fileContent));
      this.mergeRemoteData(remoteData);
      this.writeLocalDisk(this.data);
    } catch {
      // Cloud sync gracefully falls back to local/tmp state
    }
  }

  private mergeRemoteData(remote: DatabaseSchema) {
    // Merge users by id/email preserving avatars
    const userMap = new Map<string, DbUser>();
    remote.users.forEach((u) => userMap.set(u.id, u));
    this.data.users.forEach((u) => {
      const existing = userMap.get(u.id);
      if (existing) {
        userMap.set(u.id, {
          ...existing,
          ...u,
          avatarUrl: u.avatarUrl || existing.avatarUrl,
        });
      } else {
        userMap.set(u.id, u);
      }
    });
    this.data.users = Array.from(userMap.values());

    // Merge array collections by id sorted by timestamp descending
    const mergeById = <T extends { id: string; timestamp?: number }>(
      localArr: T[],
      remoteArr: T[],
      maxLen: number
    ): T[] => {
      const map = new Map<string, T>();
      remoteArr.forEach((item) => map.set(item.id, item));
      localArr.forEach((item) => map.set(item.id, item));
      return Array.from(map.values())
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, maxLen);
    };

    this.data.matches = mergeById(this.data.matches, remote.matches, 100);
    this.data.activities = mergeById(this.data.activities, remote.activities, 30);
    this.data.visits = mergeById(this.data.visits, remote.visits, 500);
    this.data.violations = mergeById(this.data.violations, remote.violations, 200);
    this.data.announcements = mergeById(this.data.announcements, remote.announcements, 50);
    this.data.messages = mergeById(this.data.messages, remote.messages, 200);
    this.data.submissions = mergeById(this.data.submissions || [], remote.submissions || [], 500);
    this.data.auditLogs = mergeById(this.data.auditLogs || [], remote.auditLogs || [], 500);
    this.data.userSessions = mergeById(this.data.userSessions || [], remote.userSessions || [], 200);

    this.data.stats = {
      totalSubmissions: this.data.submissions.length,
      totalMatches: this.data.matches.length,
      totalCodeLinesCompiled: (this.data.submissions || []).reduce(
        (acc, s) => acc + (s.linesOfCode || (s.code ? s.code.split('\n').length : 0)),
        0
      ),
      totalVisits: Math.max(
        this.data.stats?.totalVisits || 0,
        remote.stats?.totalVisits || 0,
        this.data.visits.length
      ),
    };
  }

  private writeLocalDisk(data: DatabaseSchema) {
    const serialized = JSON.stringify(data, null, 2);
    // Always write to serverless /tmp cache
    try {
      fs.writeFileSync(TMP_DB_FILE, serialized, 'utf-8');
    } catch {}

    // Also write to data/database.json if writable (local dev)
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, serialized, 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch {
      // Expected on Vercel read-only deployment directory
    }
  }

  private async pushToCloud(data: DatabaseSchema): Promise<void> {
    const gistId = process.env.CLOUD_DB_GIST_ID;
    const token = process.env.CLOUD_DB_TOKEN;
    if (!gistId || !token) return;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'CodeClash-Cloud-DB',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'codeclash_cloud_db.json': {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      this.lastCloudSync = Date.now();
    } catch {
      // Ignore transient network errors
    }
  }

  public async flushCloud(): Promise<void> {
    if (this.pendingPush) {
      await this.pendingPush;
    }
  }

  private persist(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    this.writeLocalDisk(data);
    this.pendingPush = this.pushToCloud(data);
  }

  // --- User Operations ---

  public getUsers(): DbUser[] {
    return this.data.users;
  }

  public getUserById(id: string): DbUser | null {
    return this.data.users.find((u) => u.id === id) || null;
  }

  public getUserByEmailOrHandle(identifier: string): DbUser | null {
    const clean = identifier.toLowerCase().trim();
    return (
      this.data.users.find(
        (u) => u.email.toLowerCase() === clean || u.handle.toLowerCase() === clean
      ) || null
    );
  }

  public registerUser(name: string, email: string, rawPass: string, college: string): { user: DbUser } {
    const cleanEmail = email.toLowerCase().trim();
    const handle = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '') || `user${Math.floor(100 + Math.random() * 900)}`;
    const { hash, salt } = hashPassword(rawPass);

    const newUser: DbUser = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: cleanEmail,
      handle,
      college: college.trim() || 'Invertis University',
      elo: 1000,
      matchesWon: 0,
      matchesPlayed: 0,
      joinedAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };

    this.data.users.push(newUser);
    this.addActivity({
      type: 'challenge',
      user1Name: newUser.name,
      timeAgo: 'Just now',
    });
    this.persist();
    return { user: newUser };
  }

  public registerOrGetOAuthUser(params: {
    provider: 'google' | 'github' | 'apple';
    name: string;
    email: string;
    handle?: string;
    avatarUrl?: string;
    college?: string;
    githubUrl?: string;
  }): { user: DbUser; isNew: boolean } {
    const cleanEmail = params.email.toLowerCase().trim();
    let existing = this.getUserByEmailOrHandle(cleanEmail);
    if (existing) {
      if (params.avatarUrl && !existing.avatarUrl) {
        existing.avatarUrl = params.avatarUrl;
      }
      if (params.githubUrl && !existing.githubUrl) {
        existing.githubUrl = params.githubUrl;
      }
      this.persist();
      return { user: existing, isNew: false };
    }

    const baseHandle = (
      params.handle ||
      cleanEmail.split('@')[0] ||
      `coder_${params.provider}_${Math.floor(100 + Math.random() * 900)}`
    )
      .replace(/[^a-z0-9_]/gi, '')
      .toLowerCase();

    let handle = baseHandle;
    let counter = 1;
    while (this.getUserByEmailOrHandle(handle)) {
      handle = `${baseHandle}${counter++}`;
    }

    const randomPass = `oauth_${params.provider}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const { hash, salt } = hashPassword(randomPass);

    const newUser: DbUser = {
      id: `user-${params.provider}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name.trim() || `${params.provider.toUpperCase()} Developer`,
      email: cleanEmail,
      handle,
      college: params.college?.trim() || 'Invertis University',
      avatarUrl: params.avatarUrl,
      githubUrl: params.githubUrl,
      elo: 1000,
      matchesWon: 0,
      matchesPlayed: 0,
      joinedAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };

    this.data.users.push(newUser);
    this.addActivity({
      type: 'challenge',
      user1Name: newUser.name,
      timeAgo: 'Just now',
    });
    this.persist();
    return { user: newUser, isNew: true };
  }

  public verifyCredentials(identifier: string, rawPass: string): DbUser | null {
    const user = this.getUserByEmailOrHandle(identifier);
    if (!user) return null;

    const isValid = verifyPassword(rawPass, user.passwordHash, user.salt);
    return isValid ? user : null;
  }

  public updateUserStats(userId: string, won: boolean, eloDelta: number): DbUser | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    user.matchesPlayed += 1;
    if (won) user.matchesWon += 1;
    user.elo = Math.max(100, user.elo + eloDelta);

    this.persist();
    return user;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): DbUser | null {
    const user = this.data.users.find(
      (u) =>
        u.id === userId ||
        (updates.handle && u.handle?.toLowerCase() === updates.handle.toLowerCase()) ||
        (updates.email && u.email?.toLowerCase() === updates.email.toLowerCase())
    );
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.handle !== undefined) user.handle = updates.handle.trim();
    if (updates.college !== undefined) user.college = updates.college.trim();
    if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl;
    if (updates.studentId !== undefined) user.studentId = updates.studentId.trim();
    if (updates.course !== undefined) user.course = updates.course.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.bio !== undefined) user.bio = updates.bio.trim();
    if (updates.yearSemester !== undefined) user.yearSemester = updates.yearSemester.trim();
    if (updates.githubUrl !== undefined) user.githubUrl = updates.githubUrl.trim();
    if (updates.linkedinUrl !== undefined) user.linkedinUrl = updates.linkedinUrl.trim();
    if (updates.accountStatus !== undefined) user.accountStatus = updates.accountStatus;
    if (updates.followersCount !== undefined) user.followersCount = updates.followersCount;
    if (updates.followingCount !== undefined) user.followingCount = updates.followingCount;

    this.persist();
    return user;
  }

  public createUser(params: {
    name: string;
    email: string;
    handle?: string;
    college?: string;
    role?: 'student' | 'admin' | 'proctor';
    elo?: number;
    password?: string;
    course?: string;
    studentId?: string;
    phone?: string;
  }): { user: DbUser } {
    const cleanEmail = params.email.toLowerCase().trim();
    const handle = (params.handle || cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '') || `user${Math.floor(100 + Math.random() * 900)}`).toLowerCase();
    const { hash, salt } = hashPassword(params.password || 'Invertis@2026');

    const newUser: DbUser = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name.trim(),
      email: cleanEmail,
      handle,
      college: params.college?.trim() || 'Invertis University',
      elo: params.elo || 1000,
      matchesWon: 0,
      matchesPlayed: 0,
      joinedAt: new Date().toISOString(),
      role: params.role || 'student',
      isAdmin: params.role === 'admin',
      studentId: params.studentId?.trim() || `IU${Math.floor(100000 + Math.random() * 900000)}`,
      course: params.course?.trim() || 'B.Tech CSE',
      phone: params.phone?.trim() || '',
      accountStatus: 'Active',
      passwordHash: hash,
      salt,
    };

    this.data.users.push(newUser);
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'create_user',
      actionCategory: 'auth',
      details: `Created new ${newUser.role} account for ${newUser.name} (${newUser.email})`,
    });
    this.persist();
    return { user: newUser };
  }

  public adminUpdateUser(
    userId: string,
    updates: Partial<DbUser & { role?: 'student' | 'admin' | 'proctor'; isAdmin?: boolean; password?: string }>
  ): DbUser | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.email !== undefined) user.email = updates.email.toLowerCase().trim();
    if (updates.handle !== undefined) user.handle = updates.handle.toLowerCase().trim();
    if (updates.college !== undefined) user.college = updates.college.trim();
    if (updates.role !== undefined) {
      user.role = updates.role;
      user.isAdmin = updates.role === 'admin';
    }
    if (updates.elo !== undefined) user.elo = Number(updates.elo);
    if (updates.studentId !== undefined) user.studentId = updates.studentId.trim();
    if (updates.course !== undefined) user.course = updates.course.trim();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.bio !== undefined) user.bio = updates.bio.trim();
    if (updates.accountStatus !== undefined) user.accountStatus = updates.accountStatus;
    if (updates.password && updates.password.trim()) {
      const { hash, salt } = hashPassword(updates.password.trim());
      user.passwordHash = hash;
      user.salt = salt;
    }

    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'update_user',
      actionCategory: 'auth',
      details: `Updated profile & roles for ${user.name} (@${user.handle})`,
    });

    this.persist();
    return user;
  }

  public deleteUser(userId: string): boolean {
    const idx = this.data.users.findIndex((u) => u.id === userId);
    if (idx === -1) return false;
    const deleted = this.data.users[idx];
    this.data.users.splice(idx, 1);
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'delete_user',
      actionCategory: 'auth',
      details: `Deleted user record for ${deleted.name} (@${deleted.handle})`,
    });
    this.persist();
    return true;
  }

  public setUserAccountStatus(userId: string, status: 'Active' | 'Suspended' | 'Banned'): DbUser | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;
    user.accountStatus = status;
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'set_user_status',
      actionCategory: 'auth',
      details: `Changed account status for ${user.name} to ${status}`,
    });
    this.persist();
    return user;
  }

  // --- Matches & Activities ---

  public recordMatch(match: Omit<DbMatch, 'id' | 'timestamp'>): DbMatch {
    const fullMatch: DbMatch = {
      ...match,
      id: `match-${Date.now()}`,
      timestamp: Date.now(),
    };

    this.data.matches.unshift(fullMatch);
    if (this.data.matches.length > 100) this.data.matches.pop();

    this.data.stats.totalMatches += 1;

    // Record activity event
    const winner = fullMatch.winnerId === fullMatch.player1.id ? fullMatch.player1 : fullMatch.player2;
    const loser = fullMatch.winnerId === fullMatch.player1.id ? fullMatch.player2 : fullMatch.player1;

    this.addActivity({
      type: 'match_win',
      user1Name: winner.name,
      user2Name: loser.name,
      eloChange: 28,
      timeAgo: 'Just now',
    });

    this.persist();
    return fullMatch;
  }

  public addActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>) {
    const fullEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };

    this.data.activities.unshift(fullEvent);
    if (this.data.activities.length > 30) this.data.activities.pop();
    this.persist();
  }

  public getRecentActivities(): ActivityEvent[] {
    return this.data.activities;
  }

  /**
   * Real feed computed from actual recorded events (visits + matches).
   * timeAgo is computed at read time so it stays accurate.
   */
  public getLiveFeed(limit = 30): ActivityEvent[] {
    const events: ActivityEvent[] = [];

    // 1. Direct logged activities (from real duels and problem solves)
    for (const act of this.data.activities || []) {
      events.push({
        ...act,
        timeAgo: formatTimeAgo(act.timestamp),
      });
    }

    // 2. Real accepted problem solves from submissions
    for (const sub of this.data.submissions || []) {
      if (sub.status === 'Accepted') {
        events.push({
          id: `feed-sub-${sub.id}`,
          type: 'solve',
          user1Name: sub.userName,
          problemTitle: sub.problemTitle,
          timestamp: sub.timestamp,
          timeAgo: formatTimeAgo(sub.timestamp),
        });
      }
    }

    // 3. Real matches: winner defeated loser
    for (const match of this.data.matches || []) {
      const winner =
        match.winnerId === match.player2?.id ? match.player2 : match.player1;
      const loser =
        match.winnerId === match.player2?.id ? match.player1 : match.player2;
      if (!winner) continue;
      events.push({
        id: `feed-match-${match.id}`,
        type: 'match_win',
        user1Name: winner.name,
        user2Name: loser && loser.id !== winner.id ? loser.name : undefined,
        problemTitle: match.problemCount ? `${match.problemCount} Problems Duel` : '1v1 Clash',
        eloChange: 28,
        timestamp: match.timestamp,
        timeAgo: formatTimeAgo(match.timestamp),
      });
    }

    // Sort newest first
    events.sort((a, b) => b.timestamp - a.timestamp);

    // Deduplicate same user & problem within list
    const seen = new Set<string>();
    const uniqueEvents: ActivityEvent[] = [];

    for (const ev of events) {
      const key = `${ev.type}-${ev.user1Name}-${ev.problemTitle || ev.user2Name}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEvents.push(ev);
      }
    }

    return uniqueEvents.slice(0, limit);
  }

  public incrementSubmissions(lines: number) {
    this.data.stats.totalSubmissions += 1;
    this.data.stats.totalCodeLinesCompiled += lines;
    this.persist();
  }

  // --- Admin & Telemetry Operations ---

  public recordVisit(visit: Omit<DbVisit, 'id' | 'timestamp'>): DbVisit {
    const fullVisit: DbVisit = {
      ...visit,
      id: `visit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    if (!this.data.visits) this.data.visits = [];
    this.data.visits.unshift(fullVisit);
    if (this.data.visits.length > 500) this.data.visits.pop();
    if (!this.data.stats.totalVisits) this.data.stats.totalVisits = 0;
    this.data.stats.totalVisits += 1;
    this.persist();
    return fullVisit;
  }

  public getVisits(limit = 100): DbVisit[] {
    return (this.data.visits || []).slice(0, limit);
  }

  public recordViolation(violation: Omit<DbViolation, 'id' | 'timestamp' | 'status'>): DbViolation {
    const fullViol: DbViolation = {
      ...violation,
      id: `viol-${Date.now()}`,
      status: 'pending',
      timestamp: Date.now(),
    };
    if (!this.data.violations) this.data.violations = [];
    this.data.violations.unshift(fullViol);
    this.persist();
    return fullViol;
  }

  public getViolations(): DbViolation[] {
    return this.data.violations || [];
  }

  public updateViolationStatus(id: string, status: 'resolved' | 'dismissed'): boolean {
    const v = (this.data.violations || []).find((x) => x.id === id);
    if (!v) return false;
    v.status = status;
    this.persist();
    return true;
  }

  public addAnnouncement(announcement: Omit<DbAnnouncement, 'id' | 'timestamp'>): DbAnnouncement {
    const fullAnn: DbAnnouncement = {
      ...announcement,
      id: `ann-${Date.now()}`,
      timestamp: Date.now(),
    };
    if (!this.data.announcements) this.data.announcements = [];
    this.data.announcements.unshift(fullAnn);
    this.persist();
    return fullAnn;
  }

  public getAnnouncements(): DbAnnouncement[] {
    return this.data.announcements || [];
  }

  public toggleAnnouncement(id: string): boolean {
    const a = (this.data.announcements || []).find((x) => x.id === id);
    if (!a) return false;
    a.active = !a.active;
    this.persist();
    return true;
  }

  public sendMessage(msg: Omit<DbMessage, 'id' | 'timestamp'>): DbMessage {
    const fullMsg: DbMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: Date.now(),
    };
    if (!this.data.messages) this.data.messages = [];
    this.data.messages.unshift(fullMsg);
    this.persist();
    return fullMsg;
  }

  public getMessages(): DbMessage[] {
    return this.data.messages || [];
  }

  public getMatches(limit = 50): DbMatch[] {
    return (this.data.matches || []).slice(0, limit);
  }

  public heartbeatUserSession(
    user: { id: string; name: string; handle: string; college?: string },
    telemetry?: { currentPath?: string; currentAction?: string }
  ): UserSessionRecord {
    if (!this.data.userSessions) this.data.userSessions = [];
    const now = Date.now();
    const path = telemetry?.currentPath || '/';
    const action = telemetry?.currentAction || 'Active on platform';

    // Find active session for user (last active within 40 seconds)
    let activeSession = this.data.userSessions.find(
      (s) => s.userId === user.id && s.isLive && now - s.lastActiveAt < 40000
    );

    if (activeSession) {
      activeSession.lastActiveAt = now;
      activeSession.durationSeconds = Math.max(1, Math.floor((now - activeSession.startedAt) / 1000));
      activeSession.currentPath = path;
      activeSession.currentAction = action;
    } else {
      // Mark any old sessions for this user as ended
      this.data.userSessions.forEach((s) => {
        if (s.userId === user.id && s.isLive) {
          s.isLive = false;
        }
      });

      activeSession = {
        id: `sess-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        userHandle: user.handle,
        college: user.college || 'Invertis University',
        startedAt: now,
        lastActiveAt: now,
        durationSeconds: 1,
        currentPath: path,
        currentAction: action,
        isLive: true,
        timestamp: now,
      };
      this.data.userSessions.unshift(activeSession);
      if (this.data.userSessions.length > 200) this.data.userSessions.pop();
    }

    // Accumulate online seconds on user record
    const targetUser = this.data.users.find((u) => u.id === user.id);
    if (targetUser) {
      targetUser.totalOnlineSeconds = (targetUser.totalOnlineSeconds || 0) + 4;
      targetUser.lastActiveAt = now;
    }

    this.persist();
    return activeSession;
  }

  public getUserSessions(limit = 100): UserSessionRecord[] {
    const now = Date.now();
    (this.data.userSessions || []).forEach((s) => {
      if (s.isLive && now - s.lastActiveAt > 25000) {
        s.isLive = false;
      }
    });
    return (this.data.userSessions || []).slice(0, limit);
  }

  public recordUserAudit(entry: Omit<UserAuditLog, 'id' | 'timestamp'>): UserAuditLog {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const fullLog: UserAuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    this.data.auditLogs.unshift(fullLog);
    if (this.data.auditLogs.length > 500) this.data.auditLogs.pop();
    this.persist();
    return fullLog;
  }

  public getUserAuditLogs(filter?: { userId?: string; category?: string; limit?: number }): UserAuditLog[] {
    let logs = this.data.auditLogs || [];
    if (filter?.userId) {
      logs = logs.filter((l) => l.userId === filter.userId);
    }
    if (filter?.category && filter.category !== 'all') {
      logs = logs.filter((l) => l.actionCategory === filter.category);
    }
    return logs.slice(0, filter?.limit || 150);
  }

  public recordSubmission(sub: Omit<DbSubmission, 'id' | 'timestamp'>): DbSubmission {
    if (!this.data.submissions) this.data.submissions = [];
    const fullSub: DbSubmission = {
      ...sub,
      id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
    };
    this.data.submissions.unshift(fullSub);
    if (this.data.submissions.length > 300) this.data.submissions.pop();

    this.data.stats.totalSubmissions = (this.data.stats.totalSubmissions || 0) + 1;
    this.data.stats.totalCodeLinesCompiled = (this.data.stats.totalCodeLinesCompiled || 0) + (sub.linesOfCode || 10);

    // Auto-record audit log for this submission
    this.recordUserAudit({
      userId: sub.userId,
      userName: sub.userName,
      userHandle: sub.userHandle,
      action: sub.status === 'Accepted' ? 'solve_problem' : 'submit_code',
      actionCategory: 'dsa',
      details: `${sub.status}: ${sub.problemTitle} (${sub.language.toUpperCase()}) - ${sub.passedCount}/${sub.totalCount} Passed`,
      metadata: {
        problemId: sub.problemId,
        language: sub.language,
        runtimeMs: sub.runtimeMs,
        memoryMb: sub.memoryMb,
      },
    });

    this.persist();
    return fullSub;
  }

  public getSubmissions(limit = 100): DbSubmission[] {
    return (this.data.submissions || []).slice(0, limit);
  }

  public getUserOnlineDurationsSummary() {
    const now = Date.now();
    return this.data.users.map((u) => {
      const userSessions = (this.data.userSessions || []).filter((s) => s.userId === u.id);
      const totalRecordedSeconds = userSessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      const lifetimeSeconds = Math.max(u.totalOnlineSeconds || 0, totalRecordedSeconds);
      const activeSession = userSessions.find((s) => s.isLive && now - s.lastActiveAt < 25000);

      return {
        userId: u.id,
        userName: u.name,
        userHandle: u.handle,
        college: u.college || 'Invertis University',
        avatarUrl: u.avatarUrl,
        elo: u.elo || 1000,
        course: u.course || 'B.Tech CSE',
        totalOnlineSeconds: lifetimeSeconds,
        totalOnlineMinutes: Math.floor(lifetimeSeconds / 60),
        sessionCount: userSessions.length,
        isOnline: Boolean(activeSession),
        activeSessionSeconds: activeSession ? activeSession.durationSeconds : 0,
        lastActiveAt: u.lastActiveAt || (userSessions[0]?.lastActiveAt) || now,
        currentPath: activeSession?.currentPath || '/',
        currentAction: activeSession?.currentAction || 'Offline',
      };
    }).sort((a, b) => b.totalOnlineSeconds - a.totalOnlineSeconds);
  }

  // --- DSA Problem Bank Content Management ---

  public getCustomProblems(): Problem[] {
    return this.data.customProblems || [];
  }

  public addCustomProblem(problem: Problem): Problem {
    if (!this.data.customProblems) this.data.customProblems = [];
    const newProblem: Problem = {
      ...problem,
      id: problem.id || `custom-${Date.now()}`,
      slug: problem.slug || problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    };
    this.data.customProblems.unshift(newProblem);
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'create_problem',
      actionCategory: 'dsa',
      details: `Created custom DSA challenge: "${newProblem.title}" [${newProblem.difficulty}]`,
    });
    this.persist();
    return newProblem;
  }

  public updateCustomProblem(id: string, updates: Partial<Problem>): Problem | null {
    if (!this.data.customProblems) this.data.customProblems = [];
    const prob = this.data.customProblems.find((p) => p.id === id);
    if (!prob) return null;
    Object.assign(prob, updates);
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'update_problem',
      actionCategory: 'dsa',
      details: `Updated custom DSA challenge: "${prob.title}"`,
    });
    this.persist();
    return prob;
  }

  public deleteCustomProblem(id: string): boolean {
    if (!this.data.customProblems) return false;
    const idx = this.data.customProblems.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const deleted = this.data.customProblems[idx];
    this.data.customProblems.splice(idx, 1);
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'delete_problem',
      actionCategory: 'dsa',
      details: `Deleted custom DSA challenge: "${deleted.title}"`,
    });
    this.persist();
    return true;
  }

  // --- Website Global Settings ---

  public getSiteSettings(): SiteSettings {
    if (!this.data.siteSettings) {
      this.data.siteSettings = { ...DEFAULT_SITE_SETTINGS };
    }
    return this.data.siteSettings;
  }

  public updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
    if (!this.data.siteSettings) {
      this.data.siteSettings = { ...DEFAULT_SITE_SETTINGS };
    }
    this.data.siteSettings = {
      ...this.data.siteSettings,
      ...settings,
    };
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'update_settings',
      actionCategory: 'profile',
      details: 'Updated platform configuration and contest parameters',
    });
    this.persist();
    return this.data.siteSettings;
  }

  // --- Database Management & Backups ---

  public getFullBackup(): DatabaseSchema {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreBackup(schema: any): boolean {
    if (!schema || !Array.isArray(schema.users)) {
      throw new Error('Invalid database backup payload: missing users array');
    }
    const normalized = this.normalizeSchema(schema);
    this.data = normalized;
    this.persist();
    return true;
  }

  public pruneLogs(retentionDays = 30): { prunedVisits: number; prunedAudit: number } {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const initialVisits = (this.data.visits || []).length;
    const initialAudit = (this.data.auditLogs || []).length;

    this.data.visits = (this.data.visits || []).filter((v) => v.timestamp >= cutoff);
    this.data.auditLogs = (this.data.auditLogs || []).filter((a) => a.timestamp >= cutoff);

    const prunedVisits = initialVisits - this.data.visits.length;
    const prunedAudit = initialAudit - this.data.auditLogs.length;

    this.persist();
    return { prunedVisits, prunedAudit };
  }

  // --- Security & IP Access Control ---

  public getBlockedIps(): string[] {
    return this.data.blockedIps || [];
  }

  public blockIp(ip: string): string[] {
    if (!this.data.blockedIps) this.data.blockedIps = [];
    const cleanIp = ip.trim();
    if (cleanIp && !this.data.blockedIps.includes(cleanIp)) {
      this.data.blockedIps.push(cleanIp);
      this.recordUserAudit({
        userId: 'admin',
        userName: 'Administrator',
        userHandle: 'admin',
        action: 'block_ip',
        actionCategory: 'auth',
        details: `Blocked IP address: ${cleanIp}`,
      });
      this.persist();
    }
    return this.data.blockedIps;
  }

  public unblockIp(ip: string): string[] {
    if (!this.data.blockedIps) return [];
    this.data.blockedIps = this.data.blockedIps.filter((i) => i !== ip.trim());
    this.recordUserAudit({
      userId: 'admin',
      userName: 'Administrator',
      userHandle: 'admin',
      action: 'unblock_ip',
      actionCategory: 'auth',
      details: `Unblocked IP address: ${ip}`,
    });
    this.persist();
    return this.data.blockedIps;
  }

  public isIpBlocked(ip: string): boolean {
    if (!this.data.blockedIps) return false;
    return this.data.blockedIps.includes(ip.trim());
  }

  public getStats() {
    const totalLines = (this.data.submissions || []).reduce(
      (acc, s) => acc + (s.linesOfCode || (s.code ? s.code.split('\n').length : 0)),
      0
    );
    return {
      totalSubmissions: this.data.submissions?.length || 0,
      totalMatches: this.data.matches?.length || 0,
      totalCodeLinesCompiled: totalLines,
      totalUsers: this.data.users.length,
      totalVisits: this.data.visits?.length || 0,
      activeMatches: 0,
      pendingViolations: (this.data.violations || []).filter((v) => v.status === 'pending').length,
    };
  }
}

export const db = new DatabaseEngine();

export function toSafeUser(user: DbUser): User {
  const { passwordHash, salt, ...safe } = user;
  return safe as User;
}

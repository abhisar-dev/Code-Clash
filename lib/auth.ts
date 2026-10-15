export interface User {
  id: string;
  name: string;
  email: string;
  handle: string;
  college: string;
  avatarUrl?: string; // Optional custom photo upload
  elo: number;
  matchesWon: number;
  matchesPlayed: number;
  joinedAt: string;
  role?: 'admin' | 'student' | 'proctor';
  isAdmin?: boolean;
  // Personal & Invertis Academic Information
  studentId?: string; // e.g., IU212234
  course?: string; // e.g., B.Tech CSE, BCA, MCA
  phone?: string; // e.g., 9876543210
  bio?: string; // e.g., Competitive Programmer & DSA Duelist
  yearSemester?: string; // e.g., 3rd Year • Semester 6
  githubUrl?: string;
  linkedinUrl?: string;
  accountStatus?: string; // 'Active'
  followersCount?: number;
  followingCount?: number;
  totalOnlineSeconds?: number;
  lastActiveAt?: number;
  // Gamification & Streaks
  streak?: number;
  longestStreak?: number;
  clashPoints?: number;
  badges?: string[];
  achievements?: string[];
}

export interface StoredAccount {
  user: User;
  password: string;
}

// Generate high-end, humanized initials from name
export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic subtle dark gradient for user avatar based on their name
export function getAvatarColor(name: string): { bg: string; text: string; border: string } {
  const colors = [
    { bg: 'bg-zinc-800', text: 'text-zinc-200', border: 'border-zinc-700' },
    { bg: 'bg-stone-800', text: 'text-stone-200', border: 'border-stone-700' },
    { bg: 'bg-neutral-800', text: 'text-neutral-200', border: 'border-neutral-700' },
    { bg: 'bg-slate-800', text: 'text-slate-200', border: 'border-slate-700' },
  ];

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// True competitive tier scaling: Novice (Starting rating 1000), Pupil (1100+), Specialist (1300+), etc.
export function getTier(elo: number): string {
  if (elo >= 1900) return 'Grandmaster';
  if (elo >= 1700) return 'Master';
  if (elo >= 1500) return 'Knight';
  if (elo >= 1300) return 'Specialist';
  if (elo >= 1100) return 'Pupil';
  return 'Novice';
}

const STORAGE_KEY = 'codeclash_auth_user';
const USERS_REGISTRY_KEY = 'codeclash_registered_users';
const ACCOUNTS_KEY = 'codeclash_accounts';
const MATCH_HISTORY_KEY = 'codeclash_match_history';

export function isCampusAdminOrAmbassador(u?: Partial<User> | null): boolean {
  if (!u) return false;
  if (u.id === 'user-invertis-admin') return true;
  if (u.role === 'admin' || u.isAdmin) return true;
  if (u.handle && u.handle.toLowerCase() === 'admin') return true;
  if (u.email && u.email.toLowerCase() === 'admin@invertis.ac.in') return true;
  const name = (u.name || '').toLowerCase();
  if (
    name.includes('superadmin') ||
    name.includes('ambassador') ||
    name.includes('ambassdor') ||
    name.includes('campus admin')
  ) {
    return true;
  }
  return false;
}

export function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  let accounts: StoredAccount[] = [];
  if (raw) {
    try {
      accounts = JSON.parse(raw);
    } catch {
      accounts = [];
    }
  }

  // Filter out any admin/superadmin/ambassador account
  accounts = accounts.filter((a) => a?.user && !isCampusAdminOrAmbassador(a.user));

  // Automatic Migration: incorporate users from registry and session so they are NEVER missing
  let changed = false;
  const registryRaw = localStorage.getItem(USERS_REGISTRY_KEY);
  if (registryRaw) {
    try {
      const regUsers: User[] = JSON.parse(registryRaw);
      if (Array.isArray(regUsers)) {
        regUsers.forEach((u) => {
          if (!u || !u.id || isCampusAdminOrAmbassador(u)) return;
          const uEmail = (u.email || '').toLowerCase();
          if (!accounts.some((a) => a?.user?.id === u.id || (uEmail && (a?.user?.email || '').toLowerCase() === uEmail))) {
            accounts.push({ user: u, password: '' });
            changed = true;
          }
        });
      }
    } catch {}
  }

  const sessionRaw = localStorage.getItem(STORAGE_KEY);
  if (sessionRaw) {
    try {
      const sUser: User = JSON.parse(sessionRaw);
      if (sUser && sUser.id && !isCampusAdminOrAmbassador(sUser)) {
        const sEmail = (sUser.email || '').toLowerCase();
        if (!accounts.some((a) => a?.user?.id === sUser.id || (sEmail && (a?.user?.email || '').toLowerCase() === sEmail))) {
          accounts.push({ user: sUser, password: '' });
          changed = true;
        }
      }
    } catch {}
  }

  accounts = accounts.map((a) => {
    if (a?.user?.handle === 'abhisarkumar70' || a?.user?.email === 'abhisarkumar70@gmail.com') {
      return { ...a, user: { ...a.user, name: 'Abhisar' } };
    }
    return a;
  });

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return accounts;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw);
    if (!user || typeof user !== 'object' || !user.id) return null;
    if (isCampusAdminOrAmbassador(user)) {
      // If active session was admin/superadmin/ambassador, purge it so student dashboard is clean
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (user.matchesWon === undefined) user.matchesWon = 0;
    if (user.matchesPlayed === undefined) user.matchesPlayed = 0;
    if (user.elo === undefined) user.elo = 1000;
    if (!user.name) user.name = 'Developer';
    if (!user.handle) user.handle = 'coder';
    if (!user.email) user.email = 'guest@invertis.ac.in';
    if (!user.college) user.college = 'Invertis University';
    if (user.handle === 'abhisarkumar70' || user.email === 'abhisarkumar70@gmail.com') {
      user.name = 'Abhisar';
    }
    return user;
  } catch {
    return null;
  }
}

export function saveUserSession(user: User): void {
  if (typeof window === 'undefined' || !user) return;
  if (isCampusAdminOrAmbassador(user)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  saveRegisteredUser(user);

  // Sync back into stored accounts
  const accounts = getStoredAccounts();
  const userEmail = (user.email || '').toLowerCase();
  const idx = accounts.findIndex(
    (a) => a?.user?.id === user.id || (userEmail && (a?.user?.email || '').toLowerCase() === userEmail)
  );
  if (idx >= 0) {
    accounts[idx].user = { ...accounts[idx].user, ...user };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getRegisteredUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_REGISTRY_KEY);
  let users: User[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        users = parsed.filter((u) => u && typeof u === 'object' && u.id && !isCampusAdminOrAmbassador(u));
      }
    } catch {
      users = [];
    }
  }

  // Ensure accounts are also reflected in registry
  const accounts = getStoredAccounts();
  accounts.forEach((acc) => {
    if (!acc?.user || !acc.user.id || isCampusAdminOrAmbassador(acc.user)) return;
    const accHandle = (acc.user.handle || '').toLowerCase();
    if (!users.some((u) => u?.id === acc.user.id || (accHandle && (u?.handle || '').toLowerCase() === accHandle))) {
      users.push(acc.user);
    }
  });

  // Ensure current logged-in user is part of the registry
  const current = getCurrentUser();
  if (current && current.id && !isCampusAdminOrAmbassador(current)) {
    const currentHandle = (current.handle || '').toLowerCase();
    const exists = users.some(
      (u) => u?.id === current.id || (currentHandle && (u?.handle || '').toLowerCase() === currentHandle)
    );
    if (!exists) {
      users.push(current);
    }
  }

  // Exclude admin/ambassador entirely
  users = users.filter((u) => !isCampusAdminOrAmbassador(u)).map((u) => {
    if (u.handle === 'abhisarkumar70' || u.email === 'abhisarkumar70@gmail.com') {
      return { ...u, name: 'Abhisar' };
    }
    return u;
  });

  // Save back normalized list
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));

  // Sort by rating (ELO) descending
  return users.sort((a, b) => (b.elo || 1000) - (a.elo || 1000));
}

export function saveRegisteredUser(user: User): void {
  if (typeof window === 'undefined' || !user || !user.id || isCampusAdminOrAmbassador(user)) return;
  const users = getRegisteredUsers();
  const userHandle = (user.handle || '').toLowerCase();
  const existingIdx = users.findIndex(
    (u) => u?.id === user.id || (userHandle && (u?.handle || '').toLowerCase() === userHandle)
  );

  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users.filter((u) => !isCampusAdminOrAmbassador(u))));
}

export function recordMatchResult(userId: string, isWin: boolean, eloDelta: number = 25): void {
  if (typeof window === 'undefined') return;

  // 1. Update in registry
  const users = getRegisteredUsers();
  const user = users.find((u) => u.id === userId);

  if (user) {
    user.matchesPlayed = (user.matchesPlayed || 0) + 1;
    if (isWin) {
      user.matchesWon = (user.matchesWon || 0) + 1;
      user.elo = (user.elo || 1000) + eloDelta;
    } else {
      user.elo = Math.max(600, (user.elo || 1000) - Math.floor(eloDelta / 2));
    }
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  }

  // 2. Update current active session
  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.matchesPlayed = (current.matchesPlayed || 0) + 1;
    if (isWin) {
      current.matchesWon = (current.matchesWon || 0) + 1;
      current.elo = (current.elo || 1000) + eloDelta;
    } else {
      current.elo = Math.max(600, (current.elo || 1000) - Math.floor(eloDelta / 2));
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  // 3. Update persistent account
  const accounts = getStoredAccounts();
  const acc = accounts.find((a) => a.user.id === userId);
  if (acc) {
    acc.user.matchesPlayed = (acc.user.matchesPlayed || 0) + 1;
    if (isWin) {
      acc.user.matchesWon = (acc.user.matchesWon || 0) + 1;
      acc.user.elo = (acc.user.elo || 1000) + eloDelta;
    } else {
      acc.user.elo = Math.max(600, (acc.user.elo || 1000) - Math.floor(eloDelta / 2));
    }
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

export interface MatchRecord {
  id: string;
  opponent: string;
  opponentHandle: string;
  outcome: 'Won' | 'Lost' | 'Draw';
  delta: string;
  playerScore: number;
  opponentScore: number;
  time: string;
}

export function getMatchHistory(): MatchRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MATCH_HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMatchRecord(record: MatchRecord): void {
  if (typeof window === 'undefined') return;
  const history = getMatchHistory();
  history.unshift(record);
  localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
}

// LeetCode Problem Submission Record
export interface SubmissionRecord {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Runtime Error';
  runtimeMs: number;
  memoryMb: number;
  runtimePercentile: number;
  memoryPercentile: number;
  passedCount: number;
  totalCount: number;
  timestamp: number;
  code: string;
}

const SUBMISSIONS_KEY = 'codeclash_submissions';

export function getSubmissions(problemId?: string): SubmissionRecord[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SUBMISSIONS_KEY);
  if (!raw) return [];
  try {
    const list: SubmissionRecord[] = JSON.parse(raw);
    return problemId ? list.filter((s) => s.problemId === problemId) : list;
  } catch {
    return [];
  }
}

export function saveSubmission(submission: SubmissionRecord): void {
  if (typeof window === 'undefined') return;
  const list = getSubmissions();
  list.unshift(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list.slice(0, 100)));
}

// Genuine Account Registration (Sign Up)
export function signUp(
  name: string,
  email: string,
  password: string,
  college?: string
): { success: boolean; user?: User; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Browser storage unavailable.' };

  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCollege = (college || 'Invertis University').trim();

  if (!cleanName) return { success: false, error: 'Please enter your full name.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
  if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => (a?.user?.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  // Derive handle
  let baseHandle = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!baseHandle) baseHandle = cleanEmail.split('@')[0].replace(/[^a-z0-9]/g, '') || 'coder';
  let handle = baseHandle;
  let counter = 1;
  while (accounts.some((a) => (a?.user?.handle || '').toLowerCase() === handle.toLowerCase())) {
    handle = `${baseHandle}${counter++}`;
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    email: cleanEmail,
    handle,
    college: cleanCollege,
    elo: 1000, // Starts fresh as Novice at 1000 ELO
    matchesWon: 0,
    matchesPlayed: 0,
    joinedAt: new Date().toISOString(),
  };

  accounts.push({ user: newUser, password });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  saveUserSession(newUser);
  return { success: true, user: newUser };
}

// Genuine Account Authentication (Sign In)
export function signIn(
  emailOrHandle: string,
  password: string
): { success: boolean; user?: User; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Browser storage unavailable.' };

  const query = (emailOrHandle || '').trim().toLowerCase();
  if (!query) return { success: false, error: 'Please enter your email or handle.' };
  if (!password) return { success: false, error: 'Please enter your password.' };

  // Administrative accounts are exclusively on /admin portal
  if (
    (query === 'admin' || query === 'admin@invertis.ac.in' || query === 'superadmin') &&
    (password === 'admin123' || password === 'invertisadmin')
  ) {
    return {
      success: false,
      error: 'Administrative access detected. Please log in via the dedicated portal at /admin.',
    };
  }

  const accounts = getStoredAccounts();
  let account = accounts.find((a) => {
    if (!a?.user) return false;
    const e = (a.user.email || '').toLowerCase();
    const h = (a.user.handle || '').toLowerCase();
    const n = (a.user.name || '').toLowerCase();
    const prefix = e.split('@')[0];
    return e === query || h === query || (prefix && prefix === query) || n === query;
  });

  // If still not found, check registry directly
  if (!account) {
    const registry = getRegisteredUsers();
    const regUser = registry.find((u) => {
      if (!u) return false;
      const e = (u.email || '').toLowerCase();
      const h = (u.handle || '').toLowerCase();
      const n = (u.name || '').toLowerCase();
      const prefix = e.split('@')[0];
      return e === query || h === query || (prefix && prefix === query) || n === query;
    });

    if (regUser) {
      account = { user: regUser, password };
      accounts.push(account);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  }

  if (!account) {
    return {
      success: false,
      error: 'No account found with this email or handle. Please check spelling or create an account.',
    };
  }

  // If the account was migrated without a password or has blank password, adopt the entered password
  if (!account.password) {
    account.password = password;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } else if (account.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials and try again.',
    };
  }

  // Restore latest user state from registry if available
  const registry = getRegisteredUsers();
  const regUser = registry.find((u) => u.id === account.user.id);
  const activeUser = regUser ? { ...account.user, ...regUser } : account.user;

  saveUserSession(activeUser);
  return { success: true, user: activeUser };
}

// Fallback guest creation / instant access
export function createAccount(name: string, email: string, college: string): User {
  const cleanEmail = (email || 'guest@invertis.ac.in').trim().toLowerCase();
  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => (a?.user?.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    saveUserSession(existing.user);
    return existing.user;
  }

  const res = signUp(name, email, 'password123', college);
  if (res.user) return res.user;

  const user: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || 'Developer',
    email: cleanEmail,
    handle: (name.trim() || 'coder').toLowerCase().replace(/[^a-z0-9]/g, '') || 'coder',
    college: (college || 'Invertis University').trim(),
    elo: 1000,
    matchesWon: 0,
    matchesPlayed: 0,
    joinedAt: new Date().toISOString(),
  };

  saveUserSession(user);
  return user;
}

// OAuth SSO Client-Side Handler (Google, GitHub, Apple)
export function oauthSignIn(
  provider: 'google' | 'github' | 'apple',
  profile: {
    name: string;
    email: string;
    handle?: string;
    avatarUrl?: string;
    college?: string;
    githubUrl?: string;
  }
): User {
  const cleanEmail = (profile.email || `${provider}_user@invertis.ac.in`).trim().toLowerCase();
  const accounts = getStoredAccounts();
  const existing = accounts.find((a) => (a?.user?.email || '').toLowerCase() === cleanEmail);
  if (existing) {
    if (profile.avatarUrl && !existing.user.avatarUrl) existing.user.avatarUrl = profile.avatarUrl;
    if (profile.githubUrl && !existing.user.githubUrl) existing.user.githubUrl = profile.githubUrl;
    saveUserSession(existing.user);
    saveRegisteredUser(existing.user);
    return existing.user;
  }

  const baseHandle = (
    profile.handle ||
    cleanEmail.split('@')[0] ||
    `coder_${provider}`
  )
    .replace(/[^a-z0-9_]/gi, '')
    .toLowerCase();

  let handle = baseHandle;
  let counter = 1;
  while (accounts.some((a) => (a?.user?.handle || '').toLowerCase() === handle.toLowerCase())) {
    handle = `${baseHandle}${counter++}`;
  }

  const newUser: User = {
    id: `user-${provider}-${Date.now()}`,
    name: profile.name.trim() || `${provider.toUpperCase()} Developer`,
    email: cleanEmail,
    handle,
    college: (profile.college || 'Invertis University').trim(),
    avatarUrl: profile.avatarUrl,
    githubUrl: profile.githubUrl,
    elo: 1000,
    matchesWon: 0,
    matchesPlayed: 0,
    joinedAt: new Date().toISOString(),
  };

  accounts.push({ user: newUser, password: `oauth_${provider}` });
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  saveUserSession(newUser);
  saveRegisteredUser(newUser);
  return newUser;
}

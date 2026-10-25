import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';
import { checkRateLimit, getClientIp, signAdminToken } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { action, name, identifier, password, college, websiteHoneypot } = body;

    // Bot/Spam Protection: Honeypot field must be empty for human submissions
    if (websiteHoneypot) {
      return NextResponse.json({ error: 'Automated request detected.' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    await db.ensureSynced();

    // 1. Sign Up
    if (action === 'signup') {
      if (!name || !identifier || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const existing = db.getUserByEmailOrHandle(identifier);
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email or handle already exists.' },
          { status: 409 }
        );
      }

      const { user } = db.registerUser(name, identifier, password, college || 'Invertis University');
      await db.flushCloud();
      const { passwordHash, salt, ...safeUser } = user;

      return NextResponse.json({ success: true, user: safeUser });
    }

    // 2. Sign In
    if (action === 'signin') {
      if (!identifier || !password) {
        return NextResponse.json({ error: 'Identifier and password are required' }, { status: 400 });
      }

      // Admin Superuser check in server API
      const cleanIdent = identifier.trim().toLowerCase();
      if (
        (cleanIdent === 'admin' || cleanIdent === 'admin@invertis.ac.in' || cleanIdent === 'superadmin') &&
        (password === 'admin123' || password === 'invertisadmin')
      ) {
        const existingAdmin = db.getUserById('user-invertis-admin') || db.getUserByEmailOrHandle('admin');
        const adminUser = existingAdmin
          ? {
              ...toSafeUser(existingAdmin),
              role: 'admin' as const,
              isAdmin: true,
            }
          : {
              id: 'user-invertis-admin',
              name: 'Campus SuperAdmin',
              email: 'admin@invertis.ac.in',
              handle: 'admin',
              college: 'Invertis University Administration',
              elo: 2400,
              matchesWon: 0,
              matchesPlayed: 0,
              joinedAt: '2026-08-01T00:00:00.000Z',
              role: 'admin' as const,
              isAdmin: true,
            };

        const adminToken = signAdminToken(cleanIdent);
        const res = NextResponse.json({ success: true, user: adminUser, adminToken });
        res.cookies.set('codeclash_admin_token', adminToken, {
          path: '/',
          httpOnly: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
        });
        return res;
      }

      const user = db.verifyCredentials(identifier, password);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials. User not found or password incorrect.' },
          { status: 401 }
        );
      }

      const { passwordHash, salt, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    }

    // 2.5 OAuth SSO Sign In / Sign Up (Google, GitHub, Apple)
    if (action === 'oauth') {
      const { provider, name, email, handle, avatarUrl, college, githubUrl } = body;
      if (!provider || !email) {
        return NextResponse.json(
          { error: 'Provider and email are required for SSO authentication.' },
          { status: 400 }
        );
      }

      const { user, isNew } = db.registerOrGetOAuthUser({
        provider: provider as 'google' | 'github' | 'apple',
        name: name || `${provider} User`,
        email,
        handle,
        avatarUrl,
        college: college || 'Invertis University',
        githubUrl,
      });

      await db.flushCloud();
      const { passwordHash, salt, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser, isNew });
    }

    // 3. Update Profile (Protected: sanitized field allowlist)
    if (action === 'update_profile') {
      const { userId, updates } = body;
      if (!userId || !updates) {
        return NextResponse.json({ error: 'User ID and updates are required' }, { status: 400 });
      }

      // Restrict permitted profile update fields to prevent privilege escalation
      const ALLOWED_PROFILE_KEYS = new Set([
        'name', 'college', 'avatarUrl', 'studentId', 'course',
        'phone', 'bio', 'yearSemester', 'githubUrl', 'linkedinUrl'
      ]);

      const sanitizedUpdates: Record<string, any> = {};
      for (const [key, val] of Object.entries(updates)) {
        if (ALLOWED_PROFILE_KEYS.has(key)) {
          sanitizedUpdates[key] = typeof val === 'string' ? val.trim() : val;
        }
      }

      const updated = db.updateUserProfile(userId, sanitizedUpdates);
      if (!updated) {
        return NextResponse.json({ error: 'User not found in system' }, { status: 404 });
      }

      await db.flushCloud();
      const { passwordHash, salt, ...safeUser } = updated;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

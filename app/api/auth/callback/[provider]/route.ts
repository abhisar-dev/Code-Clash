import { NextRequest, NextResponse } from 'next/server';
import { db, toSafeUser } from '@/lib/database';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.nextUrl.origin);

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/?oauth_error=${encodeURIComponent(error || 'no_code_provided')}&provider=${provider}`
    );
  }

  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  try {
    await db.ensureSynced();

    // 1. GITHUB OAUTH
    if (provider === 'github') {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${origin}/?oauth_error=missing_github_secrets&provider=github`);
      }

      // Exchange code for GitHub access token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return NextResponse.redirect(
          `${origin}/?oauth_error=${encodeURIComponent(tokenData.error_description || 'github_token_exchange_failed')}&provider=github`
        );
      }

      // Fetch user profile from GitHub
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'CodeClash-OAuth',
        },
      });
      const ghUser = await userRes.json();

      // Fetch primary email if private
      let email = ghUser.email;
      if (!email) {
        try {
          const emailRes = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': 'CodeClash-OAuth',
            },
          });
          const emails = await emailRes.json();
          if (Array.isArray(emails)) {
            const primary = emails.find((e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified) || emails[0];
            if (primary) email = primary.email;
          }
        } catch {}
      }

      if (!email) {
        email = `${ghUser.login}@github.users`;
      }

      const { user } = db.registerOrGetOAuthUser({
        provider: 'github',
        name: ghUser.name || ghUser.login,
        email,
        handle: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        githubUrl: ghUser.html_url || `https://github.com/${ghUser.login}`,
        college: 'Invertis University',
      });

      await db.flushCloud();
      const safeUser = toSafeUser(user);

      // Redirect home with active session payload in URL fragment
      const res = NextResponse.redirect(
        `${origin}/#sso_success=${encodeURIComponent(JSON.stringify(safeUser))}`
      );
      res.cookies.set('codeclash_sso_user', JSON.stringify(safeUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
      return res;
    }

    // 2. GOOGLE OAUTH
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${origin}/?oauth_error=missing_google_secrets&provider=google`);
      }

      // Exchange code for Google access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return NextResponse.redirect(
          `${origin}/?oauth_error=${encodeURIComponent(tokenData.error_description || 'google_token_exchange_failed')}&provider=google`
        );
      }

      // Fetch user profile from Google UserInfo endpoint
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const gUser = await userRes.json();

      if (!gUser.email) {
        return NextResponse.redirect(`${origin}/?oauth_error=google_email_missing&provider=google`);
      }

      const { user } = db.registerOrGetOAuthUser({
        provider: 'google',
        name: gUser.name || gUser.email.split('@')[0],
        email: gUser.email,
        avatarUrl: gUser.picture,
        college: 'Invertis University',
      });

      await db.flushCloud();
      const safeUser = toSafeUser(user);

      const res = NextResponse.redirect(
        `${origin}/#sso_success=${encodeURIComponent(JSON.stringify(safeUser))}`
      );
      res.cookies.set('codeclash_sso_user', JSON.stringify(safeUser), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
      return res;
    }

    return NextResponse.redirect(`${origin}/?oauth_error=unsupported_provider&provider=${provider}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown OAuth callback error';
    return NextResponse.redirect(`${origin}/?oauth_error=${encodeURIComponent(msg)}&provider=${provider}`);
  }
}

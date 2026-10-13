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

  const origin = 'https://codeclash-in.vercel.app';

  if (error || !code) {
    return NextResponse.redirect(
      `${origin}/?oauth_error=${encodeURIComponent(error || 'no_code_provided')}`
    );
  }

  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  try {
    await db.ensureSynced();

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(`${origin}/?oauth_error=missing_google_secrets`);
      }

      // Exchange authorization code for Google access token
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
        console.error('Google token error:', tokenData);
        return NextResponse.redirect(
          `${origin}/?oauth_error=${encodeURIComponent(
            tokenData.error_description || 'google_token_exchange_failed'
          )}`
        );
      }

      // Fetch official Google verified user profile
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const gUser = await userRes.json();

      if (!gUser.email) {
        return NextResponse.redirect(`${origin}/?oauth_error=google_email_missing`);
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
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      });
      return res;
    }

    return NextResponse.redirect(`${origin}/?oauth_error=unsupported_provider`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown OAuth callback error';
    return NextResponse.redirect(`${origin}/?oauth_error=${encodeURIComponent(msg)}`);
  }
}

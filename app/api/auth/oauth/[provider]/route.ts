import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'codeclash-in.vercel.app';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${origin}/?oauth_error=missing_google_keys`);
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=select_account`;
    return NextResponse.redirect(googleAuthUrl);
  }

  if (provider === 'github') {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(`${origin}/?oauth_error=missing_github_keys`);
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
    return NextResponse.redirect(githubAuthUrl);
  }

  return NextResponse.redirect(`${origin}/?oauth_error=invalid_provider`);
}

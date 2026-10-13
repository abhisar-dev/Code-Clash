import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : req.nextUrl.origin);
  const redirectUri = `${origin}/api/auth/callback/${provider}`;

  if (provider === 'github') {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        `${origin}/?oauth_error=missing_github_keys&provider=github`
      );
    }
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
    return NextResponse.redirect(githubAuthUrl);
  }

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        `${origin}/?oauth_error=missing_google_keys&provider=google`
      );
    }
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`;
    return NextResponse.redirect(googleAuthUrl);
  }

  if (provider === 'apple') {
    const clientId = process.env.APPLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        `${origin}/?oauth_error=missing_apple_keys&provider=apple`
      );
    }
    const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code%20id_token&scope=name%20email&response_mode=form_post`;
    return NextResponse.redirect(appleAuthUrl);
  }

  return NextResponse.redirect(`${origin}/?oauth_error=invalid_provider`);
}

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const origin = 'https://codeclash-in.vercel.app';
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

  return NextResponse.redirect(`${origin}/?oauth_error=invalid_provider`);
}

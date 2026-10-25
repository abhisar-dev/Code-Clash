import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#151311' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://codeclash-in.vercel.app'),
  title: {
    default: 'CodeClash - Real-Time 1v1 Competitive Coding',
    template: '%s | CodeClash',
  },
  description: 'Challenge peers to real-time 1v1 DSA coding duels. Automated test case evaluation in Python, JavaScript, C++, and Java.',
  keywords: ['coding duel', '1v1 coding', 'competitive programming', 'dsa interview prep', 'leetcode multiplayer', 'codeclash'],
  authors: [{ name: 'CodeClash Platform' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'CodeClash - Real-Time 1v1 Competitive Coding',
    description: 'Challenge peers to real-time 1v1 DSA coding duels. Automated test case evaluation in Python, JavaScript, C++, and Java.',
    url: 'https://codeclash-in.vercel.app',
    siteName: 'CodeClash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeClash - Real-Time 1v1 Competitive Coding',
    description: 'Challenge peers to real-time 1v1 DSA coding duels. Automated test case evaluation in Python, JavaScript, C++, and Java.',
  },
};

import { CookieConsent } from '@/components/CookieConsent';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans text-stone-900 selection:bg-amber-600 selection:text-white antialiased">
        <AnalyticsProvider />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

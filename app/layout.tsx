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
    default: 'CodeClash - Real-Time 1v1 Competitive Coding & DSA Duels',
    template: '%s | CodeClash',
  },
  description: 'Challenge peers and coders worldwide to real-time 1v1 DSA algorithmic duels. Instant automated test case evaluation in Python, JavaScript, C++, and Java with live ELO rankings.',
  keywords: [
    'coding duel',
    '1v1 coding',
    'codeclash',
    'code clash',
    'competitive programming',
    'dsa interview prep',
    'leetcode multiplayer',
    'real time coding challenge',
    'live coding battles',
    'speed coding game',
    '1v1 dsa practice',
    'algorithm duel arena',
    'python coding duel',
    'cpp coding challenge',
    'college coding contest',
    'data structures and algorithms practice'
  ],
  authors: [{ name: 'CodeClash Platform', url: 'https://codeclash-in.vercel.app' }],
  creator: 'CodeClash',
  publisher: 'CodeClash',
  category: 'technology',
  alternates: {
    canonical: 'https://codeclash-in.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'CodeClash - Real-Time 1v1 Competitive Coding & DSA Duels',
    description: 'Challenge peers to real-time 1v1 DSA coding duels. Automated test case evaluation in Python, JavaScript, C++, and Java with live ELO rankings.',
    url: 'https://codeclash-in.vercel.app',
    siteName: 'CodeClash',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeClash - Real-Time 1v1 Competitive Coding & DSA Duels',
    description: 'Challenge peers to real-time 1v1 DSA coding duels. Automated test case evaluation in Python, JavaScript, C++, and Java.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://codeclash-in.vercel.app/#webapp',
      name: 'CodeClash',
      url: 'https://codeclash-in.vercel.app',
      applicationCategory: 'EducationalApplication, GameApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires modern web browser with JavaScript enabled.',
      description: 'Real-time 1v1 competitive coding platform and algorithm battle arena with automated test evaluation in Python, JavaScript, C++, and Java.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Real-time 1v1 coding duels',
        'Instant automated test case verification',
        'Support for Python, JavaScript, C++, and Java',
        'Live ELO rating matchmaking system',
        'College & global competitive leaderboards',
        'Peer invite code multiplayer lobbies'
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://codeclash-in.vercel.app/#website',
      url: 'https://codeclash-in.vercel.app',
      name: 'CodeClash',
      description: 'Real-Time 1v1 Competitive Coding and DSA Duels platform.',
      publisher: {
        '@type': 'Organization',
        name: 'CodeClash',
        url: 'https://codeclash-in.vercel.app'
      }
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans text-stone-900 selection:bg-amber-600 selection:text-white antialiased">
        <AnalyticsProvider />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

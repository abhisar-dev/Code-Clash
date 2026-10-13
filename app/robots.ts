import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin'],
    },
    sitemap: 'https://codeclash-in.vercel.app/sitemap.xml',
  };
}

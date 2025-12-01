import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ronza-chat.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/owner-panel', '/reseller-panel'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

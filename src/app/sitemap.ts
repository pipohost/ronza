
import { MetadataRoute } from 'next';
import { getPosts, getPublicRooms } from '@/lib/server-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ronza-chat.com';

  // Get all posts
  const posts = await getPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map(({ id, timestamp }) => ({
    url: `${siteUrl}/journal/${id}`,
    lastModified: new Date(timestamp).toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Get all public rooms
  const rooms = await getPublicRooms();
  const roomEntries: MetadataRoute.Sitemap = rooms.map(({ id }) => ({
    url: `${siteUrl}/chat-room/${id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  // Define main static routes
  const mainRoutes = [
    '/',
    '/journal',
    '/features',
    '/support',
    '/download',
    '/pricing',
    '/color-pricing',
    '/reseller',
    '/about',
    '/terms',
  ];

  const staticEntries: MetadataRoute.Sitemap = mainRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.8,
    alternates: {
        languages: {
            ar: `${siteUrl}${route === '/' ? '' : route}`,
            en: `${siteUrl}/en${route === '/' ? '' : route}`,
        },
    },
  }));

  return [...staticEntries, ...postEntries, ...roomEntries];
}

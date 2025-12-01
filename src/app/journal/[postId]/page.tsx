
import { getPostById, getPosts } from '@/lib/server-data';
import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
import SinglePostClient from './single-post-client';
import { Post, WithId } from '@/lib/types';
import Script from 'next/script';

type Props = {
  params: { postId: string }
}

export async function generateStaticParams() {
    const posts = await getPosts();
    return posts.map(post => ({ postId: post.id }));
}


export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const post = await getPostById(params.postId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ronza-chat.com';

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }
  
  const previousImages = (await parent).openGraph?.images || [];
  
  const title_ar = post.title;
  const description_ar = post.content.substring(0, 160).replace(/\s+/g, ' ').trim();
  
  const title_en = post.title_en || post.title;
  const description_en = (post.content_en || post.content).substring(0, 160).replace(/\s+/g, ' ').trim();

  return {
    title: {
      absolute: `${title_ar} | مجلة رونزا`,
    },
    description: description_ar,
    alternates: {
      canonical: `${siteUrl}/journal/${post.id}`,
      languages: {
        'ar': `${siteUrl}/journal/${post.id}`,
        'en': `${siteUrl}/en/journal/${post.id}`,
      },
    },
    openGraph: {
      title: title_ar,
      description: description_ar,
      url: `${siteUrl}/journal/${post.id}`,
      images: post.imageUrl ? [{ url: post.imageUrl }] : previousImages,
      locale: 'ar_AR',
      alternateLocale: 'en_US',
      type: 'article',
      publishedTime: new Date(post.timestamp).toISOString(),
      authors: [post.authorName],
    },
     twitter: {
      card: 'summary_large_image',
      title: title_ar,
      description: description_ar,
      images: post.imageUrl ? [post.imageUrl] : previousImages,
    },
  }
}


export default async function SinglePostPage({ params }: Props) {
    const post = await getPostById(params.postId);

    if (!post) {
        notFound();
    }

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://ronza-chat.com/journal/${post.id}`,
        },
        'headline': post.title,
        'image': post.imageUrl || 'https://ronza-chat.com/og-image.png',
        'datePublished': new Date(post.timestamp).toISOString(),
        'dateModified': new Date(post.timestamp).toISOString(),
        'author': {
            '@type': 'Person',
            'name': post.authorName,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Ronza Chat',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://ronza-chat.com/logo.png',
            },
        },
        'description': post.content.substring(0, 250),
    };
    
    return (
        <div className="bg-secondary/30">
            <Script
                id="article-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <SinglePostClient post={post} />
        </div>
    );
}


'use client';

import type { WithId, Post } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface JournalHighlightProps {
  latestPost: WithId<Post>;
  newPosts: WithId<Post>[];
  olderPosts: WithId<Post>[];
}

const PostColumn = ({ title, posts, lang }: { title: string; posts: WithId<Post>[]; lang: 'ar' | 'en' }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-bold text-primary border-b-2 border-primary/30 pb-2">{title}</h3>
    <ul className="space-y-3">
      {posts.map(post => {
          const postTitle = (lang === 'en' && post.title_en) ? post.title_en : post.title;
          return (
            <li key={post.id}>
              <Link href={`/journal/${post.id}`} className="group flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mt-1 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0" />
                <span className="flex-grow">{postTitle}</span>
              </Link>
            </li>
        )
      })}
    </ul>
  </div>
);

export default function JournalHighlight({ latestPost, newPosts, olderPosts }: JournalHighlightProps) {
  const { t, lang } = useTranslation();
  
  const latestPostTitle = (lang === 'en' && latestPost.title_en) ? latestPost.title_en : latestPost.title;
  const latestPostContent = (lang === 'en' && latestPost.content_en) ? latestPost.content_en : latestPost.content;
  const contentSnippet = latestPostContent.substring(0, 120) + (latestPostContent.length > 120 ? '...' : '');

  return (
    <section className="w-full py-12 md:py-20" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        
        {/* Right Column: New Posts */}
        <PostColumn title={t.journalHighlight.latestNews} posts={newPosts} lang={lang} />

        {/* Center Column: Latest Post */}
        <div className="md:col-span-1 order-first md:order-none">
          <Card className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform md:-translate-y-8">
             {latestPost.imageUrl && (
                <div className="relative h-56 w-full">
                    <Image src={latestPost.imageUrl} alt={latestPostTitle} layout="fill" objectFit="cover" />
                </div>
            )}
            <CardHeader>
                <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(latestPost.timestamp), { addSuffix: true, locale: lang === 'ar' ? ar : enUS })}
                </p>
              <CardTitle>{latestPostTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{contentSnippet}</p>
              <Button asChild className="w-full">
                <Link href={`/journal/${latestPost.id}`}>{t.postsPage.readMore}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Left Column: Older Posts */}
        <PostColumn title={t.journalHighlight.mostRead} posts={olderPosts} lang={lang} />
      </div>
    </section>
  );
}

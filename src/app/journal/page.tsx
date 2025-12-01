

import { getPosts } from '@/lib/server-data';
import JournalClient from './journal-client';
import { Metadata } from 'next';
import type { WithId, Post } from '@/lib/types';
import translations from '@/lib/translations.json';
import { Suspense } from 'react';
import Script from 'next/script';

export async function generateMetadata({ params }: {}, parent: any): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ronza-chat.com';

  return {
    title: {
      absolute: translations.ar.postsPage.metaTitle,
    },
    description: translations.ar.postsPage.metaDescription,
    alternates: {
      canonical: `${siteUrl}/journal`,
      languages: {
        'ar': `${siteUrl}/journal`,
        'en': `${siteUrl}/en/journal`,
      },
    },
    openGraph: {
      title: translations.ar.postsPage.metaTitle,
      description: translations.ar.postsPage.metaDescription,
      url: `${siteUrl}/journal`,
      type: 'website',
      locale: 'ar_AR',
      alternateLocale: 'en_US',
    },
  };
}

const POSTS_PER_PAGE = 20;

const JournalPageContent = async ({ page }: { page: number }) => {
    const allPosts = await getPosts();
    
    // Paginate posts
    const startIndex = (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    // Sort posts for sidebars
    const sortedByDateAsc = [...allPosts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const sortedByLikes = [...allPosts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    const sortedByComments = [...allPosts].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));

    const recentPosts = allPosts.slice(0, 15);
    const oldPosts = sortedByDateAsc.slice(0, 15);
    const mostLikedPosts = sortedByLikes.slice(0, 10);
    const mostCommentedPosts = sortedByComments.slice(0, 10);

    return (
        <JournalClient
            posts={paginatedPosts}
            totalPosts={allPosts.length}
            postsPerPage={POSTS_PER_PAGE}
            recentPosts={recentPosts}
            oldPosts={oldPosts}
            mostLikedPosts={mostLikedPosts}
            mostCommentedPosts={mostCommentedPosts}
        />
    );
}


export default async function JournalPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

    return (
        <div className="bg-secondary/30">
            <Script id="dpmgo-script" strategy="afterInteractive">
                {`
                (function(dpmgo){
                var d = document,
                    s = d.createElement('script'),
                    l = d.scripts[d.scripts.length - 1];
                s.settings = dpmgo || {};
                s.src = "//cooperative-reveal.com/bDX/VCs.dAGnle0yY/WIcR/_eDmP9/upZpUFlFkRP/T/Ym2EOGTwcG2sNWTEIitMN/jzYj5zNqzBYl1NM/wC";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                l.parentNode.insertBefore(s, l);
                })({})
                `}
            </Script>
            <Script id="olt-script" strategy="afterInteractive">
                {`
                (function(olt){
                var d = document,
                    s = d.createElement('script'),
                    l = d.scripts[d.scripts.length - 1];
                s.settings = olt || {};
                s.src = "//turbulent-search.com/c.DT9/6hbc2/5KlXS_WTQk9jNvj/Ya5mNszxYf2jNoiZ0P2eNNj/kW3XNfj/YU3n";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                l.parentNode.insertBefore(s, l);
                })({})
                `}
            </Script>
            <Suspense fallback={<div>Loading...</div>}>
                <JournalPageContent page={page} />
            </Suspense>
        </div>
    );
}

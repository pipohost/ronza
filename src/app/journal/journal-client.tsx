
'use client';
import { useState, useEffect } from 'react';
import type { Post, WithId } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { MessageCircle, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import PostsPromoBanner from '@/components/posts/posts-promo-banner';
import { useSearchParams, useRouter } from 'next/navigation';

interface JournalClientProps {
  posts: WithId<Post>[];
  totalPosts: number;
  postsPerPage: number;
  recentPosts: WithId<Post>[];
  oldPosts: WithId<Post>[];
  mostLikedPosts: WithId<Post>[];
  mostCommentedPosts: WithId<Post>[];
}

function PostCard({ post }: { post: WithId<Post> }) {
    const { t, lang } = useTranslation();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const postTitle = (lang === 'en' && post.title_en) ? post.title_en : post.title;
    const postContent = (lang === 'en' && post.content_en) ? post.content_en : post.content;
    const contentSnippet = postContent.substring(0, 150) + (postContent.length > 150 ? '...' : '');
    const ReadMoreArrow = lang === 'ar' ? ArrowLeft : ArrowRight;

    return (
        <Card className="max-w-2xl mx-auto overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader className="p-6">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{postTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {post.authorName} &middot;{' '}
                            {isClient ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: lang === 'ar' ? ar : enUS }) : '...'}
                        </p>
                    </div>
                </div>
            </CardHeader>
            {post.imageUrl && (
                <div className="relative h-64 w-full">
                    <Image src={post.imageUrl} alt={postTitle} layout="fill" objectFit="cover" />
                </div>
            )}
            <CardContent className="p-6 text-base text-foreground/80 whitespace-pre-wrap font-light flex-grow">
                {contentSnippet}
            </CardContent>
            <CardFooter className="bg-secondary/50 p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        <span>{post.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments?.length || 0}</span>
                    </div>
                 </div>
                <Button asChild variant="ghost">
                    <Link href={`/journal/${post.id}`}>
                        {t.postsPage.readMore}
                        <ReadMoreArrow className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

function PostListColumn({ title, posts, lang }: { title: string, posts: WithId<Post>[], lang: 'ar' | 'en' }) {
    const ArrowComponent = lang === 'ar' ? ArrowLeft : ArrowRight;
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary border-b-2 border-primary/20 pb-2 mb-4">{title}</h3>
            <ul className="space-y-3">
                {posts.map(post => {
                    const postTitle = (lang === 'en' && post.title_en) ? post.title_en : post.title;
                    return (
                        <li key={post.id}>
                            <Link href={`/journal/${post.id}`} className="group flex items-start gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                                <ArrowComponent className="h-3 w-3 text-primary/50 group-hover:text-primary transition-colors flex-shrink-0 mt-1.5" />
                                <span className="flex-grow">{postTitle}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}

function Pagination({ currentPage, totalPages, lang }: { currentPage: number, totalPages: number, lang: string }) {
    const router = useRouter();

    const handlePageChange = (page: number) => {
        router.push(`/journal?page=${page}`);
    };

    const isRTL = lang === 'ar';
    const PrevArrow = isRTL ? ArrowRight : ArrowLeft;
    const NextArrow = isRTL ? ArrowLeft : ArrowRight;

    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <PrevArrow className="h-4 w-4" />
                <span className="mx-2">السابق</span>
            </Button>
            <span className="text-muted-foreground">
                صفحة {currentPage} من {totalPages}
            </span>
            <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
            >
                <span className="mx-2">التالي</span>
                <NextArrow className="h-4 w-4" />
            </Button>
        </div>
    );
}


const JournalClient = ({ posts, totalPosts, postsPerPage, recentPosts, oldPosts, mostLikedPosts, mostCommentedPosts }: JournalClientProps) => {
    const { t, lang, dir } = useTranslation();
    const searchParams = useSearchParams();
    const page = parseInt(searchParams.get('page') || '1', 10);

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    return (
        <div className="container mx-auto py-12" dir={dir}>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">{t.postsPage.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{t.postsPage.subtitle}</p>
            </div>
            
            <div className="mb-12">
                <PostsPromoBanner />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Right Column */}
                <aside className="lg:col-span-1 space-y-8 order-last lg:order-first">
                    <PostListColumn title={t.journalHighlight.latestNews} posts={recentPosts} lang={lang} />
                    <PostListColumn title={t.journalHighlight.mostLiked} posts={mostLikedPosts} lang={lang} />
                </aside>

                {/* Center Column */}
                <main className="lg:col-span-2 space-y-8">
                    {posts.map(post => <PostCard key={post.id} post={post} />)}
                    {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} lang={lang}/>}
                </main>
                
                {/* Left Column */}
                <aside className="lg:col-span-1 space-y-8">
                    <PostListColumn title={t.journalHighlight.oldestPosts} posts={oldPosts} lang={lang} />
                    <PostListColumn title={t.journalHighlight.mostCommented} posts={mostCommentedPosts} lang={lang} />
                </aside>
            </div>
        </div>
    );
}

export default JournalClient;

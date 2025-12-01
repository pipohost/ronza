
'use client';
import { useState, useTransition, useEffect } from 'react';
import type { Post, Comment, WithId } from '@/lib/types';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import Image from 'next/image';
import { Send, Smile, Heart, User, Twitter, Facebook, Copy, Rss } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/app/actions/journal';
import { cn } from '@/lib/utils';
import { SubmitButton } from '@/components/admin/submit-button';
import { addLike } from '@/app/actions/likes';
import { Label } from '@/components/ui/label';

const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('ronza_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('ronza_device_id', deviceId);
    }
    return deviceId;
};

const getVisitorName = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ronza_visitor_name') || '';
}

const setVisitorName = (name: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ronza_visitor_name', name);
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
      >
        <path d="M16.75 13.96c.25.13.43.2.5.33.07.13.07.55-.02.98-.09.43-.55.83-1.13 1.05-.58.22-1.13.3-1.98.18-.85-.13-2.08-.5-3.33-1.33-1.25-.83-2.2-1.85-2.9-2.93-.7-.95-1.13-2.05-1.13-3.15 0-1.1.48-1.95 1.13-2.6.65-.65 1.5-.98 2.6-.98.25 0 .5.03.75.08.43.1.7.63.78 1.05.08.43.05.85-.03 1.13-.08.28-.2.53-.35.7-.15.18-.3.35-.5.65l-.33.33c-.08.08-.13.18-.1.3.03.13.25.55.65 1.13.4.58.95 1.13 1.63 1.6.68.48 1.13.7 1.35.73.18.03.3-.03.4-.13l.33-.33c.2-.2.4-.33.6-.45.2-.13.4-.18.58-.18.2 0 .43.05.6.13zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/>
      </svg>
    )
}

function ShareButtons({ post, postTitle }: { post: WithId<Post>; postTitle: string }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [postUrl, setPostUrl] = useState('');

    useEffect(() => {
        setPostUrl(window.location.href);
    }, []);

    const encodedTitle = encodeURIComponent(postTitle);
    const encodedUrl = encodeURIComponent(postUrl);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(postUrl);
        toast({
            title: t.postsPage.linkCopied,
        });
    };

    if (!postUrl) return null;

    return (
        <div className="mt-6 text-center">
            <h4 className="font-bold mb-4">{t.postsPage.shareTitle}</h4>
            <div className="flex justify-center items-center gap-2">
                <Button asChild variant="outline" size="icon" className="rounded-full">
                    <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
                        <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                    </a>
                </Button>
                 <Button asChild variant="outline" size="icon" className="rounded-full">
                    <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
                        <Facebook className="h-5 w-5 text-[#1877F2]" />
                    </a>
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-full">
                     <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
                        <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
                    </a>
                </Button>
                 <Button variant="outline" size="icon" className="rounded-full" onClick={handleCopy} aria-label="Copy link">
                    <Copy className="h-5 w-5" />
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-full">
                    <a href="/journal/rss.xml" target="_blank" aria-label="RSS Feed">
                        <Rss className="h-5 w-5 text-[#FFA500]" />
                    </a>
                </Button>
            </div>
        </div>
    );
}

function CommentSection({ post }: { post: WithId<Post> }) {
    const { t } = useTranslation();
    const [authorName, setAuthorName] = useState('');
    const [commentText, setCommentText] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState('');

    useEffect(() => {
        setAuthorName(getVisitorName());
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
    }, []);

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setCommentText(prev => prev + emojiData.emoji);
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !authorName.trim()) {
             toast({ variant: 'destructive', title: t.postsPage.error, description: t.postsPage.errorNameComment });
             return;
        }
        
        if (parseInt(captchaAnswer) !== num1 + num2) {
            toast({ variant: 'destructive', title: t.postsPage.error, description: t.postsPage.errorCaptcha });
            setCaptchaAnswer('');
            setNum1(Math.floor(Math.random() * 10) + 1);
            setNum2(Math.floor(Math.random() * 10) + 1);
            return;
        }

        setVisitorName(authorName);

        const newCommentData = {
            postId: post.id,
            authorName: authorName,
            text: commentText,
        };

        startTransition(async () => {
            const result = await addComment(newCommentData);
            if (result.error) {
                toast({ variant: 'destructive', title: t.postsPage.error, description: result.error });
            } else {
                 setCommentText('');
                 setCaptchaAnswer('');
                 setNum1(Math.floor(Math.random() * 10) + 1);
                 setNum2(Math.floor(Math.random() * 10) + 1);
                 // No optimistic update, rely on revalidation from server action
            }
        });
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">{t.postsPage.commentsTitle}</h3>
             <div className="px-6 pb-6 space-y-4 border rounded-lg bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handleAddComment(); }} className="space-y-4 pt-6">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder={t.postsPage.commentPlaceholder}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            maxLength={200}
                            className="bg-background"
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" type="button"><Smile className="text-muted-foreground" /></Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 border-0"><EmojiPicker onEmojiClick={handleEmojiClick} /></PopoverContent>
                        </Popover>
                        <SubmitButton isSubmitting={isPending} size="icon" type="submit"><Send /></SubmitButton>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t.postsPage.namePlaceholder}
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                maxLength={20}
                                className="bg-background pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="captcha" className="text-sm whitespace-nowrap">{num1} + {num2} = </Label>
                            <Input
                                id="captcha"
                                placeholder="?"
                                value={captchaAnswer}
                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                maxLength={2}
                                className="bg-background w-20 text-center"
                            />
                        </div>
                    </div>
                </form>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 pt-4">
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="bg-secondary p-3 rounded-lg flex-1">
                                <p className="font-bold text-sm">{comment.authorName}</p>
                                <p className="text-sm text-muted-foreground">{comment.text}</p>
                            </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">{t.postsPage.noComments}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function SinglePostClient({ post: initialPost }: { post: WithId<Post> }) {
    const { t, lang } = useTranslation();
    const [post, setPost] = useState(initialPost);
    const [isLiking, startLiking] = useTransition();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
      setPost(initialPost); // Re-sync state when initialPost prop changes
    }, [initialPost]);

    const deviceId = isClient ? getDeviceId() : '';
    const hasLiked = isClient && post.likedBy?.includes(deviceId);
    
    const postTitle = (lang === 'en' && post.title_en) ? post.title_en : post.title;
    const postContent = (lang === 'en' && post.content_en) ? post.content_en : post.content;

    const handleLike = () => {
        if (!isClient) return;
        
        startLiking(async () => {
            const newLikesCount = (post.likesCount || 0) + (hasLiked ? -1 : 1);
            const newLikedBy = hasLiked 
                ? post.likedBy?.filter(id => id !== deviceId) || []
                : [...(post.likedBy || []), deviceId];
            
            setPost(prev => ({...prev, likesCount: newLikesCount, likedBy: newLikedBy }));

            try {
                await addLike(post.id, deviceId);
            } catch (error) {
                setPost(initialPost);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not process like.'});
            }
        });
    };

    return (
        <div className="container mx-auto py-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Card className="max-w-3xl mx-auto overflow-hidden shadow-lg">
                <CardHeader className="p-6 text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {t.postsPage.published}{' '}
                        {isClient ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: lang === 'ar' ? ar : enUS }) : '...'}
                    </p>
                    <CardTitle className="text-3xl md:text-4xl font-extrabold">{postTitle}</CardTitle>
                    <div className="flex items-center justify-center gap-4 text-muted-foreground">
                        <Avatar>
                            <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} />
                            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{t.postsPage.by} {post.authorName}</span>
                    </div>
                </CardHeader>
                {post.imageUrl && (
                    <div className="relative h-96 w-full">
                        <Image src={post.imageUrl} alt={postTitle} layout="fill" objectFit="cover" />
                    </div>
                )}
                <CardContent className="p-6 md:p-8 text-lg text-foreground/80 whitespace-pre-wrap font-light leading-relaxed">
                    {postContent}
                </CardContent>
                <CardContent>
                    <ShareButtons post={post} postTitle={postTitle} />
                </CardContent>
                <CardFooter className="bg-secondary/50 p-4 flex justify-center">
                    <Button variant="ghost" size="lg" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={handleLike} disabled={isLiking}>
                        <Heart className={cn("h-6 w-6", hasLiked && "text-red-500 fill-current")} />
                        <span>{t.postsPage.like} ({post.likesCount || 0})</span>
                    </Button>
                </CardFooter>
            </Card>

            <div className="max-w-3xl mx-auto">
                <CommentSection post={post} />
            </div>
        </div>
    );
}

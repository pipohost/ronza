
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Message, User, UserRole, WithId } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Bot, LogIn, LogOut, Megaphone, Sparkles, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteMessage } from '@/app/actions/moderation-actions';
import { SubmitButton } from '../admin/submit-button';


interface MessageListProps {
  messages: WithId<Message>[];
  welcomeMessage: string;
  users: WithId<User>[];
  currentUserId: string;
  roomId: string;
}

const roleNameStyles: { [key in UserRole]: string } = {
    superadmin: 'superadmin-text-gradient font-bold',
    admin: 'text-orange-400 font-semibold animate-slow-glow-orange',
    special: 'text-sky-gradient font-medium',
    visitor: 'text-green-600 dark:text-green-400',
};

const UserAvatar = React.memo(function UserAvatar({ user }: { user: WithId<User> | undefined }) {
    if (!user) {
        return (
            <Avatar className="h-10 w-10 border-2 border-white/50 shadow-md">
                <AvatarFallback>?</AvatarFallback>
            </Avatar>
        );
    }

    const { avatarUrl, name } = user;
    const IconComponent = (LucideIcons as any)[avatarUrl];
  
    if (IconComponent) {
      return (
        <Avatar className="h-10 w-10 border-2 border-white/50 shadow-md">
          <AvatarFallback className="bg-secondary">
            <IconComponent className="h-6 w-6 text-primary" />
          </AvatarFallback>
        </Avatar>
      );
    }
  
    return (
        <Avatar className="h-10 w-10 border-2 border-white/50 shadow-md">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
    );
});

// Regex to detect if a string consists only of emojis.
// It allows for 1 or 2 emojis, optionally separated by a space.
const emojiOnlyRegex = /^(?:(?:\p{Emoji_Presentation}|\p{Emoji_Modifier_Base})(?:\uFE0F\s*)){1,2}$/u;


function DeleteMessageDialog({ message, roomId, children }: { message: WithId<Message>, roomId: string, children: React.ReactNode }) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteMessage(roomId, message.id);
            toast({
                title: "Message Deleted",
                description: "The message has been removed from the chat.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "Error",
                description: error.message || "Failed to delete message.",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete this message for everyone. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                         <SubmitButton variant="destructive" onClick={handleDelete} isSubmitting={isDeleting}>Delete Message</SubmitButton>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function MessageList({ messages, welcomeMessage, users, currentUserId, roomId }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { lang } = useTranslation();
  const { playMessageReceived, playMention } = useSoundEffects();
  const [titleInterval, setTitleInterval] = useState<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>('');

  const stopTitleFlashing = useCallback(() => {
    if (titleInterval) {
      clearInterval(titleInterval);
      setTitleInterval(null);
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    }
  }, [titleInterval]);

  useEffect(() => {
    originalTitleRef.current = document.title;
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        stopTitleFlashing();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTitleFlashing(); // Cleanup on unmount
    };
  }, [stopTitleFlashing]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
    
    // Sound and notification logic
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.userId === currentUserId || lastMessage.type === 'status') return;
    
    const currentUser = users.find(u => u.id === currentUserId);
    const mentionRegex = currentUser ? new RegExp(`@${currentUser.name}(\\b|$)`, 'i') : null;

    if (mentionRegex && mentionRegex.test(lastMessage.text)) {
        playMention();
        if (document.hidden && !titleInterval) {
           const newInterval = setInterval(() => {
             document.title = document.title === originalTitleRef.current ? 'رسالة جديدة!' : originalTitleRef.current;
           }, 1000);
           setTitleInterval(newInterval);
        }
    } else {
        playMessageReceived();
    }
  }, [messages, currentUserId, users, playMessageReceived, playMention, titleInterval, stopTitleFlashing]);

  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const renderMessageText = (text: string) => {
    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser) return text;

    const mentionRegex = new RegExp(`(@${currentUser.name})(\\b|$)`, 'gi');
    
    const parts = text.split(mentionRegex);

    return parts.map((part, index) => {
        if (part.toLowerCase() === `@${currentUser.name}`.toLowerCase()) {
            return (
                <span key={index} className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100 font-bold rounded-md px-1 mx-0.5">
                    {part}
                </span>
            );
        }
        return part;
    });
  }
  
  const currentUser = users.find(u => u.id === currentUserId);
  const isModerator = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  const renderMessage = (msg: WithId<Message>) => {
    
    // Special rendering for announcements
    if (msg.userName.startsWith('📢')) {
       const announcementTitle = lang === 'en' && msg.userName_en ? msg.userName_en.replace('📢 ', '') : msg.userName.replace('📢 ', '');
       return (
          <div key={msg.id} className="my-4">
              <Card className="max-w-md mx-auto promo-banner-bg text-white shadow-lg">
                  <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                          <Megaphone className="h-5 w-5" />
                          <h3 className="font-bold">{announcementTitle}</h3>
                      </div>
                      <p className="text-lg promo-text-glow">{msg.text}</p>
                  </CardContent>
              </Card>
          </div>
      );
    }
    
    if (msg.type === 'status') {
      const isJoin = msg.text.includes('joined') || msg.text.includes('انضم');
      const isLeave = msg.text.includes('left') || msg.text.includes('غادر');
      const isDeleted = msg.text.includes('deleted by') || msg.text.includes('حذف رسالة');
      const Icon = isJoin ? LogIn : isLeave ? LogOut : isDeleted ? Trash2 : Bot;
      const color = isJoin ? 'text-green-600 dark:text-green-400' : isLeave ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400';
      return (
        <div key={msg.id} className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-dashed border-gray-300 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
                 <span className={cn("italic text-sm bg-background px-3 py-1 rounded-full shadow-sm flex items-center gap-2", color)}>
                    <Icon className="h-4 w-4" />
                    {msg.text}
                 </span>
            </div>
        </div>
      );
    }
    
    const user = getUserById(msg.userId);
    const isRTL = lang === 'ar';
    const isEmojiOnly = emojiOnlyRegex.test(msg.text.trim());
    
    const canDelete = isModerator && msg.userId !== currentUserId;

    return (
      <div key={msg.id} className={cn("group flex gap-3 items-start", isRTL ? 'flex-row-reverse' : 'flex-row')}>
          <UserAvatar user={user} />
          <div className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
              <p className={cn('font-semibold', roleNameStyles[msg.userRole])}>
                  {msg.userName}
              </p>
              <p 
                className={cn(
                  "text-gray-800 dark:text-gray-200",
                  isEmojiOnly ? 'large-emoji-text' : 'text-lg',
                )}
                style={{ fontSize: isEmojiOnly ? '' : '18pt', color: msg.color, wordBreak: 'break-word' }} 
                dir="auto"
              >
                  {renderMessageText(msg.text)}
              </p>
          </div>
           {canDelete && (
                <DeleteMessageDialog message={msg} roomId={roomId}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </DeleteMessageDialog>
            )}
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 space-y-4">
        <Card className="bg-gradient-to-br from-primary/80 to-blue-400/80 dark:from-primary/50 dark:to-blue-900/50 shadow-lg border-0 text-white">
            <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 mb-3 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white animate-slow-glow-white" />
                </div>
                <p className="font-semibold text-lg">{welcomeMessage}</p>
            </CardContent>
        </Card>
        {messages.map(renderMessage)}
      </div>
    </ScrollArea>
  );
}

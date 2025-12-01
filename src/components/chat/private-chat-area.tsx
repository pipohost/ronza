'use client';

import * as React from 'react';
import { collection, query, onSnapshot, orderBy, where, Timestamp } from 'firebase/firestore';
import type { WithId, User, PrivateMessage, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import * as LucideIcons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '../ui/card';
import { Info } from 'lucide-react';

const roleNameStyles: { [key in UserRole]: string } = {
    superadmin: 'superadmin-text-gradient font-bold',
    admin: 'text-orange-400 font-semibold animate-slow-glow-orange',
    special: 'text-sky-gradient font-medium',
    visitor: 'text-green-600 dark:text-green-400',
};

// Regex to detect if a string consists only of emojis.
const emojiOnlyRegex = /^(?:(?:\p{Emoji_Presentation}|\p{Emoji_Modifier_Base})(?:\uFE0F\s*)){1,2}$/u;

interface PrivateChatAreaProps {
  roomId: string;
  currentUser: WithId<User>;
  targetUser: WithId<User>;
  db: any;
}

const UserAvatar = React.memo(function UserAvatar({ user, avatarUrl }: { user: WithId<User> | undefined, avatarUrl: string }) {
    if (!user) {
        return (
            <Avatar className="h-10 w-10 border-2 border-white/50 shadow-md">
                <AvatarFallback>?</AvatarFallback>
            </Avatar>
        );
    }

    const { name } = user;
    const isIconName = avatarUrl && typeof avatarUrl === 'string' && LucideIcons[avatarUrl as keyof typeof LucideIcons];
    const IconComponent = isIconName ? (LucideIcons as any)[avatarUrl as keyof typeof LucideIcons] : null;

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


export default function PrivateChatArea({ 
    roomId, currentUser, targetUser, db
 }: PrivateChatAreaProps) {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = React.useState<WithId<PrivateMessage>[]>([]);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const joinTimestamp = React.useRef(Timestamp.now());

  React.useEffect(() => {
    if (!db || !roomId || !currentUser.id || !targetUser.id) {
        setMessages([]);
        return;
    }
    
    const conversationId = [currentUser.id, targetUser.id].sort().join('_');
    const messagesCollectionRef = collection(db, `chat_rooms/${roomId}/privateMessages/${conversationId}/messages`);
    
    const q = query(
        messagesCollectionRef,
        where('timestamp', '>', joinTimestamp.current),
        orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages: WithId<PrivateMessage>[] = [];
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                newMessages.push({ id: change.doc.id, ...change.doc.data() } as WithId<PrivateMessage>);
            }
        });
        if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
        }
    }, (error) => {
        console.error("Error fetching private messages:", error);
    });

    return () => unsubscribe();
  }, [db, currentUser.id, targetUser.id, roomId]);


  React.useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent min-h-0">
        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto bg-white/70 dark:bg-black/30 backdrop-blur-md min-h-0">
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
                 <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-3 text-center text-sm text-blue-800 dark:text-blue-200">
                       <div className="flex items-center justify-center gap-2">
                         <Info className="h-4 w-4"/>
                         <span>{t.room.private_chat_with.replace('{user}', targetUser.name)}</span>
                       </div>
                    </CardContent>
                </Card>
                {messages.map((msg) => {
                    const isSender = msg.fromId === currentUser.id;
                    const user = isSender ? currentUser : targetUser;
                    const role = isSender ? currentUser.role : targetUser.role;
                    const isEmojiOnly = emojiOnlyRegex.test(msg.text.trim());
                    
                    return (
                         <div
                            key={msg.id}
                            className={cn("flex gap-3 items-start", lang === 'ar' ? 'flex-row-reverse' : 'flex-row')}
                        >
                            <UserAvatar user={user} avatarUrl={user.avatarUrl} />
                            <div className={cn(lang === 'ar' ? 'text-right' : 'text-left')}>
                                <p className={cn('font-semibold', roleNameStyles[role])}>
                                    {user.name}
                                </p>
                                <p 
                                    className={cn(
                                    "text-gray-800 dark:text-gray-200",
                                    isEmojiOnly ? 'large-emoji-text' : 'text-lg',
                                    )}
                                    style={{ fontSize: isEmojiOnly ? '' : '18pt', color: msg.color, wordBreak: 'break-word' }} 
                                    dir="auto"
                                >
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    );
                })}
                </div>
            </ScrollArea>
        </div>
    </div>
  );
}

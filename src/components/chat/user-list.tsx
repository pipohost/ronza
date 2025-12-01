
'use client';

import * as React from 'react';
import type { User, UserRole, WithId, CosmeticRank, MicQueueEntry } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import * as LucideIcons from 'lucide-react';
import { Mic, Video, Hand, Bed, Utensils, GlassWater, DoorOpen, Car, Phone, MessageSquare, ShieldBan, Star, Heart, LogOut, Search, BellRing, Clock, PenLine, Crown, Infinity, Megaphone, Repeat, ShieldOff, Trash2, MicOff as MicOffIcon, MessageSquareOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
  } from "@/components/ui/dropdown-menu"
import { User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { banUser, muteUser, logoutUser, sendUserAlert, grantOpenMic, sendPublicAnnouncement, toggleUserRole, forceMicDrop, forceMicDropAll, toggleDnd, clearChat } from '@/app/actions/moderation-actions';
import { useTranslation } from '@/hooks/use-translation';
import SendAlertDialog from './send-alert-dialog';


const roleNameStyles: { [key in UserRole]: string } = {
  superadmin: 'superadmin-text-gradient font-bold text-lg',
  admin: 'text-orange-400 font-semibold animate-slow-glow-orange text-lg',
  special: 'text-sky-gradient font-medium text-lg',
  visitor: 'text-green-600 dark:text-green-400 text-lg',
};

const cosmeticRankStyles: { [key in CosmeticRank]: { card: string, name: string } } = {
    mythical_admin: { card: 'relative overflow-hidden border-yellow-400/50', name: 'gold-text-glow font-bold' },
    registered_member: { card: 'border-green-500/50', name: 'text-green-500' },
    background_name: { card: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg', name: 'text-white font-semibold' },
    super_name: { card: 'superadmin-gradient text-white shadow-lg', name: 'text-yellow-300 font-bold' },
};


const statusIcons: { [key: string]: React.ReactNode } = {
    sleeping: <Bed className="h-4 w-4 text-purple-500" />,
    eating: <Utensils className="h-4 w-4 text-orange-500" />,
    drinking: <GlassWater className="h-4 w-4 text-blue-500" />,
    away: <DoorOpen className="h-4 w-4 text-gray-500" />,
    driving: <Car className="h-4 w-4 text-red-500" />,
    oncall: <Phone className="h-4 w-4 text-green-500" />,
};


const renderStars = (role: UserRole, cosmeticRole: CosmeticRank | null) => {
    if (cosmeticRole) {
        const starConfig = {
          mythical_admin: { count: 7, className: 'text-yellow-400', heart: true },
          super_name: { count: 5, className: 'text-yellow-400', heart: true },
          background_name: { count: 6, className: 'text-blue-400', heart: true },
          registered_member: { count: 4, className: 'text-green-400', heart: false },
        };
        const config = starConfig[cosmeticRole as keyof typeof starConfig];
        if (!config) return null;
        return (
            <div className="flex justify-center items-center gap-0.5">
                {config.heart && <Heart className="h-3 w-3 text-red-400" fill="currentColor" />}
                {Array.from({ length: config.count }).map((_, i) => (
                    <Star key={i} className={cn('h-3 w-3', config.className)} fill="currentColor" />
                ))}
                {config.heart && <Heart className="h-3 w-3 text-red-400" fill="currentColor" />}
            </div>
        );
    }
    
    if (role === 'visitor') return null;

    const roleStarConfig = {
      superadmin: { count: 5, className: 'text-yellow-400', heart: true },
      admin: { count: 4, className: 'text-gray-400', heart: false },
      special: { count: 6, className: 'text-blue-400', heart: true },
    };

    const config = roleStarConfig[role as keyof typeof roleStarConfig];
    if (!config) return null;

    return (
        <div className="flex justify-center items-center gap-0.5">
            {config.heart && <Heart className="h-3 w-3 text-red-400" fill="currentColor" />}
            {Array.from({ length: config.count }).map((_, i) => (
                <Star key={i} className={cn('h-3 w-3', config.className)} fill="currentColor" />
            ))}
            {config.heart && <Heart className="h-3 w-3 text-red-400" fill="currentColor" />}
        </div>
    );
};

interface UserAvatarProps {
    user: WithId<User>;
}

const UserAvatar = ({ user }: UserAvatarProps) => {
    const { avatarUrl, avatarColor, name } = user;
    const isIconName = avatarUrl && typeof avatarUrl === 'string' && LucideIcons[avatarUrl as keyof typeof LucideIcons];
    const IconComponent = isIconName ? (LucideIcons as any)[avatarUrl as keyof typeof LucideIcons] : null;

    if (IconComponent) {
        return (
            <Avatar className="h-10 w-10 border-2 border-gray-300 dark:border-gray-600 shadow-md">
                <AvatarFallback className="bg-secondary">
                    <IconComponent className="h-6 w-6" style={{ color: avatarColor }} />
                </AvatarFallback>
            </Avatar>
        );
    }
  
    return (
      <Avatar className="h-10 w-10 border-2 border-gray-300 dark:border-gray-600 shadow-md">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
      </Avatar>
    );
};

const MicTimer = ({ user }: { user: WithId<User> }) => {
    const MIC_TIME_LIMIT = 5 * 60; // 5 minutes in seconds
    const [timeLeft, setTimeLeft] = React.useState(MIC_TIME_LIMIT);

    React.useEffect(() => {
        if (!user.isSpeaking || user.hasOpenMic || !user.micTimeStarted) {
            return;
        }

        const interval = setInterval(() => {
            const elapsed = (Date.now() - user.micTimeStarted!) / 1000;
            const newTimeLeft = Math.max(0, MIC_TIME_LIMIT - elapsed);
            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(interval);
    }, [user.isSpeaking, user.micTimeStarted, user.hasOpenMic]);

    if (!user.isSpeaking) return null;

    if (user.hasOpenMic) {
        return (
            <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                <Infinity className="h-3 w-3" />
                <span>وقت مفتوح</span>
            </div>
        );
    }

    if (!user.micTimeStarted) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    return (
        <div className="flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
        </div>
    );
};


interface UserCardProps {
    user: WithId<User>;
    currentUserProfile: WithId<User>;
    onUserClick: (user: WithId<User>) => void;
    onStartViewingVideo: (userId: string) => void;
    roomId: string;
    isQueued: boolean;
}

function UserCard({ user, currentUserProfile, onUserClick, onStartViewingVideo, roomId, isQueued }: UserCardProps) {
    
    const { t, lang } = useTranslation();
    const moderationT = t.moderation;
    const { toast } = useToast();
    const isCurrentUser = user.id === currentUserProfile.id;
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    
    const isMythicalAdmin = currentUserProfile.cosmeticRole === 'mythical_admin';
    const canToggleRole = isMythicalAdmin && !isCurrentUser && user.cosmeticRole !== 'mythical_admin';
    const isSuperOrMythical = currentUserProfile.role === 'superadmin' || isMythicalAdmin;


    let cardStyle = 'bg-white/80 dark:bg-gray-800/80 shadow';
    let nameStyle = roleNameStyles[user.role];

    if (user.cosmeticRole) {
        const cosmeticStyle = cosmeticRankStyles[user.cosmeticRole];
        if (cosmeticStyle) {
            cardStyle = cosmeticStyle.card;
            nameStyle = cosmeticStyle.name;
        }
    }
    
    const canPerformAction = (currentUserProfile.role === 'special' || currentUserProfile.role === 'admin' || currentUserProfile.role === 'superadmin' || isMythicalAdmin) && !isCurrentUser;
    const canGrantOpenMic = canPerformAction && user.isSpeaking && !user.hasOpenMic;

    const handlePrivateMessage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUserClick(user);
    }

    const handleAction = async (action: Promise<any>, successMessage: string, errorMessage: string) => {
        try {
            await action;
            toast({ title: "Success", description: successMessage });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || errorMessage });
        }
    };

    const handleMute = () => {
        const successMsg = user.isMuted 
            ? t.room.unmute_user_success.replace('{user}', user.name) 
            : t.room.mute_user_success.replace('{user}', user.name);
        handleAction(muteUser(roomId, user.id), successMsg, t.room.mute_user_fail);
    }
    
    const handleKick = () => {
        handleAction(logoutUser(roomId, user.id), t.room.kick_user_success.replace('{user}', user.name), t.room.kick_user_fail);
    }
    
    const handleBan = () => {
        if (!user.deviceId) {
            console.error("Cannot ban user: deviceId is missing.", user);
            toast({ variant: "destructive", title: "Error", description: "Cannot ban user, device ID is missing." });
            return;
        }
        const reason = prompt(t.room.ban_reason_prompt.replace('{user}', user.name));
        if (reason !== null) {
             handleAction(banUser(roomId, user.id, user.deviceId, reason), t.room.ban_user_success.replace('{user}', user.name), t.room.ban_user_fail);
        }
    }

    const handleGrantOpenMic = () => {
        const successMessage = user.hasOpenMic ? moderationT.openMicRevoked.replace('{user}', user.name) : moderationT.openMicGranted.replace('{user}', user.name);
        handleAction(grantOpenMic(roomId, user.id), successMessage, "Failed to grant open mic.");
    }
    
    const handleSendAlert = async (message: string) => {
        handleAction(sendUserAlert(roomId, user.id, message), moderationT.alertSent.replace('{user}', user.name), "Failed to send alert.");
    }

    const handleSendAnnouncement = async () => {
        const message = prompt(moderationT.sendPublicAnnouncement);
        if (message) {
            handleAction(sendPublicAnnouncement(roomId, message), moderationT.announcementSent, "Failed to send announcement");
        }
    };
    
    const handleToggleRole = () => {
        handleAction(toggleUserRole(roomId, user.id), moderationT.roleToggledSuccess.replace('{user}', user.name), "Failed to toggle user role.");
    };

    const handleForceMicDrop = () => handleAction(forceMicDrop(roomId, user.id), moderationT.micDropSuccess.replace('{user}', user.name), "Failed to drop mic.");
    const handleForceMicDropAll = () => handleAction(forceMicDropAll(roomId), moderationT.micDropAllSuccess, "Failed to drop all mics.");
    const handleToggleDnd = () => {
        const successMessage = currentUserProfile.dnd ? moderationT.dndDisabledSuccess : moderationT.dndEnabledSuccess;
        handleAction(toggleDnd(roomId), successMessage, "Failed to toggle DND.");
    };
    const handleClearChat = () => handleAction(clearChat(roomId), moderationT.chatClearedSuccess, "Failed to clear chat.");

    const hasNewPrivateMessage = currentUserProfile.newPrivateMessageFrom?.includes(user.name);

    const cardContent = (
      <Card
        onClick={() => onUserClick(user)}
        className={cn(
            "relative flex items-center gap-2 p-2 rounded-lg transition-all duration-300 border border-black/10 dark:border-white/10 hover:shadow-lg hover:-translate-y-0.5", 
            cardStyle,
            user.isSpeaking && 'ring-2 ring-green-500 shadow-lg',
            user.isTyping && 'ring-2 ring-blue-400',
            isCurrentUser ? 'cursor-default' : 'cursor-pointer',
            hasNewPrivateMessage && 'ring-2 ring-red-500 animate-pulse'
        )}
        >
        {user.backgroundUrl && <div className="absolute inset-0 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(${user.backgroundUrl})`, opacity: 0.3 }}></div>}
        <div className="relative flex items-center gap-2 w-full">
            <UserAvatar user={user} />
            <div className="flex-1 overflow-hidden">
                <div className={cn("flex items-center gap-2")}>
                    {user.status && statusIcons[user.status]}
                     {user.isRoleStripped && <ShieldOff className="h-4 w-4 text-red-500" title="Role Stripped" />}
                    <p className={cn("truncate font-medium text-lg", nameStyle)}>{user.name}</p>
                    {user.dnd && <MessageSquareOff className="h-4 w-4 text-muted-foreground" title={moderationT.dndEnabledSuccess} />}
                    {user.isTyping && <PenLine className="h-4 w-4 text-blue-500" />}
                    {user.isSpeaking && <Mic className="h-4 w-4 text-green-500" />}
                    {user.handRaised && !user.isSpeaking && !isQueued && <Hand className="h-4 w-4 text-yellow-500 animate-pulse" />}
                    {isQueued && !user.isSpeaking && <Clock className="h-4 w-4 text-blue-400" title="In mic queue"/>}
                    {user.isCameraOn && (
                        <button onClick={(e) => { e.stopPropagation(); onStartViewingVideo(user.id); }} className="p-0 m-0 bg-transparent border-0 cursor-pointer" title={t.watchStream}>
                            <Video className="h-4 w-4 text-blue-500 hover:text-blue-400" />
                        </button>
                    )}
                </div>
                <div className={cn("h-4 flex items-center text-xs mt-0.5", user.cosmeticRole === 'mythical_admin' && 'text-white/80')}>
                    {hasNewPrivateMessage ? (
                            <div className="flex items-center gap-1 text-red-500 font-bold text-xs animate-pulse">
                                <MessageSquare className="h-3 w-3" />
                                <span>رسالة جديدة</span>
                            </div>
                        ) : user.statusText ? (
                            <p className="text-xs truncate">{user.statusText}</p>
                        ) : user.isSpeaking && user.role === 'visitor' ? (
                            <MicTimer user={user} />
                        ) : renderStars(user.role, user.cosmeticRole)}
                </div>
            </div>
            <div className="relative ml-auto flex-shrink-0">
                {(user.role === 'superadmin' || user.cosmeticRole === 'mythical_admin') && <Crown className="h-4 w-4 text-yellow-400" fill="#FFD700" />}
                {user.role === 'special' && <Crown className="h-4 w-4 text-blue-400" fill="#38B6FF" />}
            </div>
        </div>
      </Card>
    );

    if (isCurrentUser) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {cardContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align={lang === 'ar' ? 'start' : 'end'}>
                     {isSuperOrMythical && (
                        <>
                            <DropdownMenuItem onClick={handleSendAnnouncement}><Megaphone className="mr-2" />{moderationT.sendPublicAnnouncement}</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleForceMicDropAll}><MicOffIcon className="mr-2" />{moderationT.forceMicDropAll}</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleToggleDnd}><MessageSquareOff className="mr-2" />{moderationT.toggleDnd}</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleClearChat}><Trash2 className="mr-2" />{moderationT.clearChat}</DropdownMenuItem>
                        </>
                     )}
                </DropdownMenuContent>
             </DropdownMenu>
        )
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {cardContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align={lang === 'ar' ? 'start' : 'end'}>
                    <DropdownMenuItem onClick={handlePrivateMessage}>
                        <MessageSquare className="mr-2" /><span>{t.pm}</span>
                    </DropdownMenuItem>
                    {user.isCameraOn && (
                        <DropdownMenuItem onClick={() => onStartViewingVideo(user.id)}>
                            <Video className="mr-2" /><span>{t.watchStream}</span>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                        <UserIcon className="mr-2" /><span>{t.profile}</span>
                    </DropdownMenuItem>
                    
                    {(canPerformAction || isSuperOrMythical) && <DropdownMenuSeparator />}
                    
                    {canGrantOpenMic && <DropdownMenuItem onClick={handleGrantOpenMic}><Infinity className="mr-2 text-blue-500" /><span>{user.hasOpenMic ? moderationT.revokeOpenMic : moderationT.grantOpenMic}</span></DropdownMenuItem>}
                    {isSuperOrMythical && user.isSpeaking && <DropdownMenuItem onClick={handleForceMicDrop}><MicOffIcon className="mr-2" /><span>{moderationT.forceMicDrop}</span></DropdownMenuItem>}
                    {canToggleRole && <DropdownMenuItem onClick={handleToggleRole}><Repeat className="mr-2" /><span>{moderationT.toggleRole}</span></DropdownMenuItem>}
                    
                    {canPerformAction &&
                        <>
                            <DropdownMenuItem onClick={() => setIsAlertOpen(true)}><BellRing className="mr-2 text-yellow-500" /><span>{moderationT.sendUserAlert}</span></DropdownMenuItem>
                            <DropdownMenuItem onClick={handleMute}>{user.isMuted ? <Mic className="mr-2" /> : <MicOffIcon className="mr-2" />}<span>{user.isMuted ? t.unmute : t.mute}</span></DropdownMenuItem>
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleKick}><LogOut className="mr-2" /><span>{t.kick}</span></DropdownMenuItem>
                            <DropdownMenuItem onClick={handleBan} className="text-destructive focus:text-destructive"><ShieldBan className="mr-2" /><span>{t.ban}</span></DropdownMenuItem>
                        </>
                    }
                </DropdownMenuContent>
            </DropdownMenu>
            {canPerformAction && (
                 <SendAlertDialog
                    isOpen={isAlertOpen}
                    onClose={() => setIsAlertOpen(false)}
                    targetUser={user}
                    onSendAlert={handleSendAlert}
                />
            )}
        </>
    )
}

interface UserListProps {
    roomId: string;
    users: WithId<User>[];
    micQueue: MicQueueEntry[];
    currentUserProfile: WithId<User>;
    onUserClick: (user: WithId<User>) => void;
    onStartViewingVideo: (userId: string) => void;
}

export default function UserList({ roomId, users, micQueue, currentUserProfile, onUserClick, onStartViewingVideo }: UserListProps) {
    const { t, lang } = useTranslation();
    const queueUserIds = new Set(micQueue.map(u => u.userId));

    const sortedUsers = React.useMemo(() => {
        const roleOrder: Record<UserRole, number> = { superadmin: 0, admin: 1, special: 2, visitor: 3 };

        return [...users].sort((a, b) => {
            // 1. The current speaker is always first.
            if (a.isSpeaking) return -1;
            if (b.isSpeaking) return 1;

            // 2. Sort by role.
            const roleComparison = roleOrder[a.role] - roleOrder[b.role];
            if (roleComparison !== 0) return roleComparison;

            // 3. Fallback to sorting by name if roles are the same.
            return a.name.localeCompare(b.name);
        });
    }, [users]);


  return (
    <div className={cn("bg-transparent flex flex-col h-full shadow-inner", lang === 'ar' ? 'border-l' : 'border-r')}>
      <div className={cn("p-4 border-b border-black/10 dark:border-white/10 text-center bg-white/10 dark:bg-black/20 backdrop-blur-sm")}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t.members} ({users.length})</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {sortedUsers.map(user => (
            <UserCard 
              key={user.id} 
              user={user} 
              currentUserProfile={currentUserProfile} 
              onUserClick={onUserClick}
              onStartViewingVideo={onStartViewingVideo}
              roomId={roomId}
              isQueued={queueUserIds.has(user.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

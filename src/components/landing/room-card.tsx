'use client';

import * as React from 'react';
import type { Room, WithId } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '../ui/skeleton';
import { Users, Heart, Star, Video } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { addOrRemoveReaction } from '@/app/actions/reactions';

const getDeviceId = () => {
    if (typeof window === 'undefined') return '';
    let deviceId = localStorage.getItem('ronza_device_id');
    if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem('ronza_device_id', deviceId);
    }
    return deviceId;
};

export const RoomCardSkeleton = () => {
  return (
    <Card className="overflow-hidden flex flex-col shadow-md">
      <CardHeader className="p-0">
        <Skeleton className="h-32 w-full" />
      </CardHeader>
      <CardContent className="pt-6 flex-grow text-center">
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/4 mx-auto" />
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="flex justify-center items-center gap-4 w-full">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

export const RoomCard = ({ room, onReaction, joinNowText }: { room: WithId<Room>; onReaction: (roomId: string, updates: Partial<Room>) => void; joinNowText: string; }) => {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const IconComponent = (LucideIcons as any)[room.icon || 'MessageSquare'] || LucideIcons.MessageSquare;
    const imageUrl = `https://picsum.photos/seed/${room.id}/400/200`;

    const [hasReactedHeart, setHasReactedHeart] = useState(false);
    const [hasReactedStar, setHasReactedStar] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (typeof window !== 'undefined') {
            const deviceId = getDeviceId();
            setHasReactedHeart(room.heartUsers?.includes(deviceId) ?? false);
            setHasReactedStar(room.starUsers?.includes(deviceId) ?? false);
        }
    }, [room.heartUsers, room.starUsers]);

    const handleReaction = (type: 'heart' | 'star') => {
        if (!isClient) return;
        const deviceId = getDeviceId();
        const hasReacted = type === 'heart' ? hasReactedHeart : hasReactedStar;
        
        const optimisticCount = (room[type === 'heart' ? 'heartCount' : 'starCount'] || 0) + (hasReacted ? -1 : 1);
        onReaction(room.id, { [type === 'heart' ? 'heartCount' : 'starCount']: optimisticCount });
        if (type === 'heart') setHasReactedHeart(!hasReacted);
        if (type === 'star') setHasReactedStar(!hasReacted);

        startTransition(async () => {
            try {
                await addOrRemoveReaction(room.id, deviceId, type, hasReacted ? 'remove' : 'add');
            } catch (error) {
                onReaction(room.id, { [type === 'heart' ? 'heartCount' : 'starCount']: room[type === 'heart' ? 'heartCount' : 'starCount'] });
                if (type === 'heart') setHasReactedHeart(hasReacted);
                if (type === 'star') setHasReactedStar(hasReacted);
                toast({ variant: 'destructive', title: "Something went wrong" });
            }
        });
    };
    
    const handleJoinClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const width = 1100;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        window.open(
            `/chat-room/${room.id}`,
            `Ronza4ChatRoom_${room.id}`,
            `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
        );
    }

    return (
        <Card className="overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0 relative h-32">
                <Image
                    src={imageUrl}
                    alt={room.name}
                    fill
                    className="object-cover"
                    data-ai-hint="nature landscape"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <IconComponent className="h-12 w-12 text-white/80 drop-shadow-lg" />
                </div>
            </CardHeader>
            <CardContent className="pt-6 flex-grow text-center">
                <h3 className="text-lg font-bold mb-2">{room.name}</h3>
                <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{room.userCount || 0} / {room.maxUsers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600">
                        <Video className="h-4 w-4" />
                        <span>{room.cameraOnCount || 0}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-4">
                <div className="flex justify-center items-center gap-4 text-muted-foreground">
                    <button onClick={() => handleReaction('heart')} disabled={isPending} className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors">
                        <span>{room.heartCount || 0}</span>
                        <Heart className={cn("h-5 w-5", hasReactedHeart ? "text-red-500 fill-current" : "text-muted-foreground")} />
                    </button>
                     <button onClick={() => handleReaction('star')} disabled={isPending} className="flex items-center gap-1 cursor-pointer hover:text-yellow-400 transition-colors">
                        <span>{room.starCount || 0}</span>
                        <Star className={cn("h-5 w-5", hasReactedStar ? "text-yellow-400 fill-current" : "text-muted-foreground")} />
                    </button>
                </div>
                <Button onClick={handleJoinClick} className="w-full bg-primary text-primary-foreground">
                  {joinNowText}
                </Button>
              </CardFooter>
        </Card>
    );
};

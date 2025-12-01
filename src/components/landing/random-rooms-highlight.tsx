'use client';

import type { WithId, Room } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Heart, Star, Video } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const handleJoinClick = (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    const width = 1100;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(
        `/chat-room/${roomId}`,
        `Ronza4ChatRoom_${roomId}`,
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
}

export default function RandomRoomsHighlight({ rooms }: { rooms: WithId<Room>[] }) {
    if (rooms.length === 0) {
        return null;
    }

    return (
        <section className="w-full py-8 md:py-12">
            <div className="flex justify-center items-start gap-4 md:gap-6 flex-wrap">
                <TooltipProvider>
                    {rooms.map((room, index) => {
                        const imageSeed = `${room.id}_${index}`;
                        const imageUrl = `https://picsum.photos/seed/${imageSeed}/100/100`;

                        return (
                             <Tooltip key={room.id}>
                                <TooltipTrigger asChild>
                                    <a href={`/chat-room/${room.id}`} onClick={(e) => handleJoinClick(e, room.id)} className="block group transition-transform duration-300 hover:-translate-y-2">
                                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-primary/50 shadow-lg">
                                            <Image
                                                src={imageUrl}
                                                alt={`Image for ${room.name}`}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="attractive portrait"
                                            />
                                        </div>
                                        <div className="relative mt-[-20px] mx-auto w-[90%] bg-black/50 backdrop-blur-sm text-white rounded-full p-1.5 shadow-md">
                                            <div className="flex justify-around items-center text-xs">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>{room.userCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="h-3 w-3" />
                                                    <span>{room.heartCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3" />
                                                    <span>{room.starCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-green-400">
                                                    <Video className="h-3 w-3" />
                                                    <span>{room.cameraOnCount || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>انضم إلى غرفة {room.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </div>
        </section>
    );
}



'use client'

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Heart, Star, Video } from 'lucide-react';
import type { Room, WithId } from '@/lib/types';
import { useState, useEffect } from 'react';
import { getPublicRooms } from '@/lib/server-data';
import { useTranslation } from '@/hooks/use-translation';
import { RoomCard, RoomCardSkeleton } from './room-card';

const FeaturedRoomCard = ({ room }: { room: WithId<Room> }) => {
    const { t } = useTranslation();
    const featuredRoomTranslations = t.publicRooms.featuredRoom;
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const phrases = featuredRoomTranslations.phrases;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length);
        }, 2000);
        return () => clearInterval(intervalId);
    }, [phrases.length]);

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
        <div className="col-span-full mb-8">
            <Card className="relative overflow-hidden promo-banner-bg text-white shadow-2xl transition-all duration-300 hover:shadow-blue-500/50">
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <span className="emoji-particle">😀</span>
                    <span className="emoji-particle">😂</span>
                    <span className="emoji-particle">😍</span>
                    <span className="emoji-particle">🥳</span>
                    <span className="emoji-particle">👍</span>
                    <span className="emoji-particle">❤️</span>
                    <span className="emoji-particle">⭐</span>
                    <span className="emoji-particle">🎉</span>
                    <span className="emoji-particle">💯</span>
                </div>
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8">
                    <div className="flex-1 text-center md:text-right">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight promo-text-glow">
                            {room.name}
                        </h2>
                        <div key={currentPhraseIndex} className="mt-2 text-lg text-blue-200 animate-in fade-in duration-500">
                           {phrases[currentPhraseIndex]}
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                         <div className="flex items-center gap-4 text-lg">
                            <div className="flex items-center gap-1">
                                <Users className="h-5 w-5" />
                                <span>{room.userCount || 0} / {room.maxUsers}</span>
                            </div>
                            <div className="flex items-center gap-1 text-green-400">
                                <Video className="h-5 w-5" />
                                <span>{room.cameraOnCount || 0}</span>
                            </div>
                        </div>
                        <Button onClick={handleJoinClick} size="lg" className="bg-white/90 text-primary hover:bg-white font-bold text-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
                          {featuredRoomTranslations.joinNow}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};


export default function PublicRooms({ initialRooms }: { initialRooms: WithId<Room>[] }) {
    const { t } = useTranslation();
    const translations = t.publicRooms;
    const [activeSort, setActiveSort] = useState('popular');
    const [activeCategory, setActiveCategory] = useState('all');
    const [rooms, setRooms] = useState<WithId<Room>[]>(initialRooms || []);
    const [isLoading, setIsLoading] = useState(false);
    
    const featuredRoomId = "OfNAmtWExwBmt2dlhIOh";

    const categories = [
        { id: 'all', labelKey: 'all', icon: '🌐' },
        { id: 'european', labelKey: 'european', icon: '🇪🇺' },
        { id: 'american', labelKey: 'american', icon: '🇺🇸' },
        { id: 'asian', labelKey: 'asian', icon: '🌏' },
    ];

    const sortRooms = (roomsToSort: WithId<Room>[], filter: string) => {
        let sorted = [...roomsToSort];
        if (filter === 'latest') {
            sorted.sort((a, b) => ((b as any).timestamp?.seconds || 0) - ((a as any).timestamp?.seconds || 0));
        } else if (filter === 'popular') {
            sorted.sort((a, b) => (b.userCount || 0) - (a.userCount || 0));
        } else if (filter === 'favorite') {
             sorted.sort((a, b) => ((b.heartCount || 0) + (b.starCount || 0)) - ((a.heartCount || 0) + (a.starCount || 0)));
        }
        return sorted;
    }

    const filterRooms = (roomsToFilter: WithId<Room>[], category: string) => {
        if (category === 'all') {
            return roomsToFilter;
        }
        return roomsToFilter.filter(room => room.categories?.includes(category));
    }


    useEffect(() => {
        setRooms(sortRooms(initialRooms || [], activeSort));

        const intervalId = setInterval(async () => {
          const freshRooms = await getPublicRooms();
          if (freshRooms && Array.isArray(freshRooms)) {
            setRooms(currentRooms => {
                // Create a map of the new rooms for quick lookup
                const freshRoomsMap = new Map(freshRooms.map(r => [r.id, r]));
                // Update existing rooms or add new ones
                const updatedRooms = (currentRooms || []).map(oldRoom => freshRoomsMap.get(oldRoom.id) || oldRoom);
                // Add any brand new rooms that weren't there before
                freshRooms.forEach(freshRoom => {
                    if (!(currentRooms || []).some(r => r.id === freshRoom.id)) {
                        updatedRooms.push(freshRoom);
                    }
                });
                return sortRooms(updatedRooms, activeSort);
            });
          }
        }, 15000);

        return () => clearInterval(intervalId);
    }, [initialRooms]);

     useEffect(() => {
        setIsLoading(true);
        setRooms(prevRooms => sortRooms(prevRooms, activeSort));
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, [activeSort]);
    
    const handleRoomUpdate = (roomId: string, updates: Partial<Room>) => {
        setRooms(prevRooms => prevRooms.map(r => r.id === roomId ? { ...r, ...updates } : r));
    }
    
    const featuredRoom = rooms.find(r => r.id === featuredRoomId);
    const otherRooms = filterRooms(rooms, activeCategory).filter(r => r.id !== featuredRoomId && r.isPublic);

  return (
    <>
        <section id="public-rooms" className="w-full pb-12 md:pb-24 lg:pb-32">
        <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                    {translations.title}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {translations.subtitle}
                </p>
            </div>
            <div className="flex items-center gap-4 pt-4">
                <span className="text-muted-foreground">{translations.sortBy}</span>
                <Button variant={activeSort === 'latest' ? 'default' : 'outline'} onClick={() => setActiveSort('latest')}>
                    <Clock className="mr-2 h-4 w-4" /> {translations.latest}
                </Button>
                <Button variant={activeSort === 'popular' ? 'default' : 'outline'} onClick={() => setActiveSort('popular')}>
                    <Star className="mr-2 h-4 w-4" /> {translations.popular}
                </Button>
                <Button variant={activeSort === 'favorite' ? 'default' : 'outline'} onClick={() => setActiveSort('favorite')}>
                    <Heart className="mr-2 h-4 w-4" /> {translations.favorite}
                </Button>
            </div>
             <div className="flex items-center flex-wrap justify-center gap-2 pt-2">
                {categories.map(category => (
                    <Button key={category.id} variant={activeCategory === category.id ? 'secondary' : 'ghost'} size="sm" onClick={() => setActiveCategory(category.id)}>
                        <span className="mr-2">{category.icon}</span>
                        {translations.categories[category.labelKey as keyof typeof translations.categories]}
                    </Button>
                ))}
            </div>
            </div>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center gap-6 mt-12">
            
            {featuredRoom && <FeaturedRoomCard room={featuredRoom} />}

            {isLoading && Array.from({ length: 8 }).map((_, i) => <RoomCardSkeleton key={i} />)}
            
            {!isLoading && otherRooms.length > 0 && otherRooms.map((room) => (
                <RoomCard key={room.id} room={room} onReaction={handleRoomUpdate} joinNowText={translations.joinNow} />
            ))}

            {!isLoading && rooms.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground">{translations.noRooms}</p>
            )}
             {!isLoading && otherRooms.length === 0 && activeCategory !== 'all' && (
                <p className="col-span-full text-center text-muted-foreground">لا توجد غرف في هذا التصنيف حالياً.</p>
            )}
            </div>
        </div>
        </section>
    </>
  );
}

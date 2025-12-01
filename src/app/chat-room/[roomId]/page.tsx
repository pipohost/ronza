
import * as React from 'react';
import type { WithId, Room, User } from '@/lib/types';
import { getRoomById, getUsers, getFirebaseConfig, getResellerById } from '@/lib/server-data';
import { notFound } from 'next/navigation';
import ChatRoomShell from './chat-room-shell';
import type { Metadata } from 'next';

type Props = {
    params: { roomId: string };
};

// Generate dynamic metadata for each room page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const room = await getRoomById(params.roomId);

    if (!room) {
        return {
            title: 'Room Not Found',
            description: 'This chat room is not available.',
            robots: {
                index: false,
                follow: false,
            }
        }
    }

    let title = `انضم إلى غرفة ${room.name} | شات رونزا`;
    
    // If the room is owned by a reseller, customize the title
    if (room.ownerId !== 'root') {
        const reseller = await getResellerById(room.ownerId);
        if (reseller) {
            title = `${room.name} | ${reseller.name}`;
        }
    }

    const description = room.description ? `${room.description.substring(0, 150)}...` : `دردشة صوتية وكتابية مباشرة في غرفة ${room.name}. انضم الآن!`;

    return {
        title,
        description,
        openGraph: {
            title: title,
            description: description,
            type: 'website',
            url: `/chat-room/${params.roomId}`,
            images: [
                {
                    url: `https://picsum.photos/seed/${params.roomId}/1200/630`,
                    width: 1200,
                    height: 630,
                    alt: room.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [`https://picsum.photos/seed/${params.roomId}/1200/630`],
        },
    }
}


// This is the main page for the popped-out chat window.
// It is now a Server Component to fetch all necessary data initially.
export default async function ChatRoomPage({ params }: Props) {
    const { roomId } = params;

    if (!roomId) {
        notFound();
    }

    const [room, users, firebaseConfig] = await Promise.all([
        getRoomById(roomId),
        getUsers(roomId),
        getFirebaseConfig()
    ]);
    
    if (!room) {
        // Even if room is not found, we render the shell which will show an error.
        // This is better than a hard 404 for a popup window experience.
    }
    
    const initialData = {
        room: room,
        users: users || [],
        firebaseConfig: firebaseConfig,
    };

    const structuredData = room ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': `غرفة دردشة ${room.name}`,
        'description': room.description,
        'url': `https://ronza-chat.com/chat-room/${room.id}`,
        'potentialAction': {
            '@type': 'ViewAction',
            'target': `https://ronza-chat.com/chat-room/${room.id}`
        }
    } : null;

    return (
        <div className="h-screen w-screen">
            {structuredData && (
                 <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}
            <ChatRoomShell
                roomId={roomId}
                initialData={initialData}
            />
        </div>
    );
}



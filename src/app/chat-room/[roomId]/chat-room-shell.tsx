
'use client';

import * as React from 'react';
import ChatClient from './chat-client';
import LoginClient from './login-client';
import type { WithId, Room, User } from '@/lib/types';
import { type FirebaseServices } from './firebase-client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leaveRoom } from '@/app/actions/user-leave';
import { cn } from '@/lib/utils';
import KickedDialog from '@/components/chat/kicked-dialog';

interface ChatRoomShellProps {
    roomId: string;
    initialData: {
        room: WithId<Room> | null;
        users: WithId<User>[];
        firebaseConfig: any;
    };
}

export default function ChatRoomShell({ roomId, initialData }: ChatRoomShellProps) {
    const [session, setSession] = React.useState<{
        currentUserProfile: WithId<User>;
        firebaseServices: FirebaseServices;
    } | null>(null);

    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isOnline, setIsOnline] = React.useState(true);
    const [kickReason, setKickReason] = React.useState<string | null>(null);
    const unloadRef = React.useRef(false);


    React.useEffect(() => {
        if (!initialData.room) {
            setError("Room not found or access denied.");
        }
    }, [initialData.room]);
    
    const handleManualLeave = React.useCallback(async () => {
        if (session && roomId && !unloadRef.current) {
            unloadRef.current = true;
            // This is a manual leave, not from a beacon
            await leaveRoom(roomId, session.currentUserProfile.id);
            window.close();
        } else {
            window.close();
        }
    }, [session, roomId]);

    React.useEffect(() => {
        const handleUnload = (event: Event) => {
            if (session && roomId && !unloadRef.current) {
                unloadRef.current = true;
                const data = JSON.stringify({ roomId, userId: session.currentUserProfile.id });
                // Use sendBeacon for reliable background sending on unload.
                navigator.sendBeacon('/api/logout', data);
            }
        };

        // `pagehide` is more reliable on mobile browsers.
        window.addEventListener('pagehide', handleUnload);
        // `beforeunload` is a fallback for older desktop browsers.
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('pagehide', handleUnload);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [session, roomId]);


    const handleLoginSuccess = (userProfile: WithId<User>, firebaseServices: FirebaseServices) => {
        if (userProfile.kickReason) {
            setKickReason(userProfile.kickReason);
        } else {
            setSession({
                currentUserProfile: userProfile,
                firebaseServices,
            });
        }
    };
    
    if (isLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                <p>Loading Room...</p>
            </div>
        );
    }

    if (error || !initialData.room) {
       return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-destructive p-4 text-center">
                 <p className="font-bold text-lg mb-2">Failed to load room</p>
                 <p>{error || "Could not retrieve room data."}</p>
                 <Button onClick={() => window.close()} className="mt-4">Close</Button>
            </div>
        );
    }

    if (kickReason) {
        return <KickedDialog reason={kickReason} onClose={() => window.close()} />;
    }
    
    if (!session) {
         return (
            <LoginClient
                room={initialData.room}
                firebaseConfig={initialData.firebaseConfig}
                onLoginSuccess={handleLoginSuccess}
                onClose={() => window.close()}
            />
         );
    }

    return (
        <div className={cn(
            "h-screen w-screen relative", 
            !isOnline && "pointer-events-none",
            initialData.room.backgroundGradient ? initialData.room.backgroundGradient : 'bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-950'
          )}
          style={initialData.room.backgroundGradient ? {} : {}}
        >
            <ChatClient
                room={initialData.room}
                currentUserProfile={session.currentUserProfile}
                initialUsers={initialData.users}
                firebaseServices={session.firebaseServices}
                onClose={handleManualLeave}
                isOnline={isOnline}
                setIsOnline={setIsOnline}
            />
        </div>
    );
}

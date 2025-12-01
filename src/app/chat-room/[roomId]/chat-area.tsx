'use client';

import * as React from 'react';
import type { Room, Message, User, WithId } from '@/lib/types';
import VideoDisplay from '@/components/chat/video-display';
import MessageList from '@/components/chat/message-list';
import { Rnd } from 'react-rnd';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface ChatAreaProps {
  room: WithId<Room>;
  messages: WithId<Message>[];
  users: WithId<User>[];
  currentUserId: string;
  localStream: MediaStream | null;
  remoteStreams: { [key: string]: MediaStream };
  roomId: string;
}

export default function ChatArea({ 
    room, messages, users, currentUserId, 
    localStream, remoteStreams, roomId,
}: ChatAreaProps) {
  const { t } = useTranslation();
  const [hiddenVideos, setHiddenVideos] = React.useState<Set<string>>(new Set());

  const hideVideo = (userId: string) => {
    setHiddenVideos(prev => new Set(prev).add(userId));
  };

  // Combine local and remote streams into a single object for rendering
  const allStreams = React.useMemo(() => {
    const streams: { [key: string]: { stream: MediaStream; isLocal?: boolean } } = {};
    
    // Add local stream if camera is on
    const localUser = users.find(u => u.id === currentUserId);
    if (localStream && localUser?.isCameraOn) {
      streams[currentUserId] = { stream: localStream, isLocal: true };
    }

    // Add remote streams
    for (const userId in remoteStreams) {
      const remoteUser = users.find(u => u.id === userId);
      // Only show if the user's camera is supposed to be on
      if (remoteUser?.isCameraOn) {
        streams[userId] = { stream: remoteStreams[userId], isLocal: false };
      }
    }
    
    return streams;
  }, [localStream, remoteStreams, users, currentUserId]);


  return (
    <div 
        className={cn(
            "flex-1 flex flex-col h-full relative overflow-hidden bg-transparent min-h-0"
        )}
    >
      
      {Object.entries(allStreams).map(([userId, { stream, isLocal }]) => (
          <Rnd
            key={userId}
            default={{ x: 50, y: 50, width: 240, height: 180 }}
            minWidth={200}
            minHeight={150}
            bounds="parent"
            className="bg-black rounded-lg shadow-2xl border-2 border-primary overflow-hidden z-20"
            style={{ display: hiddenVideos.has(userId) ? 'none' : 'block' }}
          >
            <VideoDisplay key={stream.id} stream={stream} isLocal={isLocal} />
            <button onClick={() => hideVideo(userId)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white z-30 hover:bg-red-500">
              <X className="h-4 w-4" />
            </button>
          </Rnd>
        ))}

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto bg-white/70 dark:bg-black/30 backdrop-blur-md min-h-0">
        <MessageList messages={messages} welcomeMessage={room.welcomeMessage} users={users} currentUserId={currentUserId} roomId={roomId} />
      </div>
    </div>
  );
}
    
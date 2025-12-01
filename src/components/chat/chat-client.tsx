
'use client';

import * as React from 'react';
import type { Room, User, Message, WithId, PrivateMessage, MicQueueEntry } from '@/lib/types';
import UserList from '@/components/chat/user-list';
import PrivateChatArea from '@/components/chat/private-chat-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Languages, X, Users2, Sparkles, Sun, Moon, MessageSquare, Lock, Unlock } from 'lucide-react';
import { getFirestore, doc, collection, onSnapshot, addDoc, updateDoc, serverTimestamp, query, orderBy, where, runTransaction, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { FirebaseApp, Auth } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { createPeerConnection, closePeerConnection } from '@/lib/webrtc';
import { cn } from '@/lib/utils';
import ChatArea from '@/app/chat-room/[roomId]/chat-area';
import { useTranslation } from '@/hooks/use-translation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ReconnectingModal from '@/components/chat/reconnecting-modal';
import VolumeMeter from '@/components/chat/volume-meter';
import AlertNotificationDialog from '@/components/chat/alert-notification-dialog';
import ChatInput from '@/components/chat/chat-input';
import { updateRoomSettings } from '@/app/actions/owner-panel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { leaveRoom } from '@/app/actions/user-leave';


interface ChatClientProps {
  room: WithId<Room>;
  currentUserProfile: WithId<User>;
  initialUsers: WithId<User>[];
  firebaseServices: { app: FirebaseApp, auth: Auth, db: any };
  onClose: () => Promise<void>;
  isOnline: boolean;
  setIsOnline: (isOnline: boolean) => void;
}

export default function ChatClient({ room: initialRoom, currentUserProfile, initialUsers, firebaseServices, onClose, isOnline, setIsOnline }: ChatClientProps) {
  const { db, auth } = firebaseServices;
  const { toast } = useToast();
  const { t, lang, toggleLanguage, dir } = useTranslation();
  
  const [room, setRoom] = React.useState<WithId<Room>>(initialRoom);
  const [usersInRoom, setUsersInRoom] = React.useState<WithId<User>[]>(initialUsers);
  const [micQueue, setMicQueue] = React.useState<MicQueueEntry[]>(initialRoom.mic_queue || []);
  const [messages, setMessages] = React.useState<WithId<Message>[]>([]);
  const [localStream, setLocalStream] = React.useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = React.useState(true);
  const [isRoomMuted, setIsRoomMuted] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [isConfirmingClose, setIsConfirmingClose] = React.useState(false);

  // --- Private Chat State ---
  const [privateChats, setPrivateChats] = React.useState<WithId<User>[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>('public');


  React.useEffect(() => {
    const savedTheme = localStorage.getItem('ronza_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('ronza_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  const peerConnections = React.useRef<{ [key: string]: RTCPeerConnection | null }>({});
  const [remoteStreams, setRemoteStreams] = React.useState<{ [key: string]: MediaStream }>({});
  
  const currentUserInRoom = usersInRoom.find(u => u.id === auth.currentUser?.uid);
  
  const joinTimestamp = React.useRef(Timestamp.now());

    // Heartbeat effect to keep user 'lastSeen' updated
    React.useEffect(() => {
        if (!db || !auth.currentUser) return;

        const userDocRef = doc(db, `chat_rooms/${initialRoom.id}/users/${auth.currentUser.uid}`);

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
              updateDoc(userDocRef, { lastSeen: serverTimestamp() }).catch(err => {
                  console.warn("Failed to send heartbeat, user might be offline or kicked.", err.message);
              });
            }
        }, 15000); // 15 seconds

        return () => clearInterval(intervalId);

    }, [db, auth.currentUser, initialRoom.id]);


  const sendSystemMessage = React.useCallback(async (text: string) => {
    if (!db || !room.id) return;
    const systemMessage: Omit<Message, 'timestamp'> = {
      userId: 'system',
      userName: 'System',
      userRole: 'visitor',
      text,
      color: '#888888',
      type: 'status',
    };
    await addDoc(collection(db, `chat_rooms/${room.id}/messages`), {
      ...systemMessage,
      timestamp: serverTimestamp(),
    });
  }, [db, room.id]);

  const startViewingVideo = React.useCallback(async (targetUserId: string) => {
    if (!auth.currentUser || peerConnections.current[targetUserId]) {
      return; 
    }
    
    // toast({ title: "Connecting...", description: `Requesting video from ${targetUserId}` });

    const pc = createPeerConnection(auth.currentUser.uid, targetUserId, db, room.id, localStream, (remoteStream) => {
        setRemoteStreams(prev => ({...prev, [targetUserId]: remoteStream}));
    });
    peerConnections.current[targetUserId] = pc;
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const offerData = { type: 'offer', sdp: offer.sdp };

    const peerDocRef = doc(db, `chat_rooms/${room.id}/users/${targetUserId}`);
    await updateDoc(peerDocRef, { [`offers.${auth.currentUser.uid}`]: offerData });

  }, [localStream, auth.currentUser, db, room.id]);

  // Listener for room data
  React.useEffect(() => {
    if (!db) return;
    const roomUnsubscribe = onSnapshot(doc(db, `chat_rooms/${room.id}`), { includeMetadataChanges: true }, (snapshot) => {
        if (snapshot.exists()) {
            const roomData = { id: snapshot.id, ...snapshot.data() } as WithId<Room>;
            setRoom(roomData);
            setMicQueue(roomData.mic_queue || []);
        } else {
            toast({ variant: 'destructive', title: 'Room Closed', description: 'This room has been closed by the owner.' });
            onClose();
        }
        setIsOnline(!snapshot.metadata.fromCache);
    });
    return () => roomUnsubscribe();
  }, [db, room.id, onClose, toast, setIsOnline]);

  // Listener for users collection
  React.useEffect(() => {
      if (!db || !auth.currentUser) return;
      let isInitialLoad = true;

      const usersQuery = collection(db, `chat_rooms/${room.id}/users`);
      const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const updatedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<User>));
          setUsersInRoom(updatedUsers);

          // Check if current user was kicked
          const currentUserStillInRoom = updatedUsers.some(u => u.id === auth.currentUser!.uid);
          if (!isInitialLoad && !currentUserStillInRoom) {
              toast({ variant: 'destructive', title: 'Disconnected', description: 'You have been disconnected from the room.' });
              onClose();
              return;
          }
          isInitialLoad = false;
        
          // Handle user removals for WebRTC cleanup
          snapshot.docChanges().forEach((change) => {
              if (change.type === "removed") {
                  const peerId = change.doc.id;
                  if (peerId !== auth.currentUser!.uid) {
                      closePeerConnection(peerId, peerConnections);
                      setRemoteStreams(prev => {
                          const newStreams = { ...prev };
                          delete newStreams[peerId];
                          return newStreams;
                      });
                  }
              }
          });
      }, (error) => {
          console.error("Error listening to users collection:", error);
      });

      return () => usersUnsubscribe();
  }, [db, auth.currentUser, room.id, onClose, toast]);


  // Listener for messages
  React.useEffect(() => {
      if (!db) return;
      const messagesQuery = query(
          collection(db, `chat_rooms/${room.id}/messages`),
          where('timestamp', '>=', joinTimestamp.current),
          orderBy('timestamp', 'asc')
      );
      const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
           if (snapshot.metadata.hasPendingWrites) {
               return; // Ignore local changes to prevent duplicate messages
           }
          // If the snapshot is empty, it means the chat was cleared.
          if (snapshot.empty && messages.length > 0) {
              setMessages([]);
              return;
          }
          const newMessages: WithId<Message>[] = [];
          snapshot.docChanges().forEach(change => {
              if (change.type === 'added') {
                  const msgData = { id: change.doc.id, ...change.doc.data() } as WithId<Message>;
                  newMessages.push(msgData);
              }
          });
           if (newMessages.length > 0) {
            setMessages(prev => {
                const uniqueMessages = [...prev];
                newMessages.forEach(msg => {
                    if (!uniqueMessages.some(m => m.id === msg.id)) {
                        uniqueMessages.push(msg);
                    }
                });
                return uniqueMessages.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
            });
          }
      }, (error) => {
          console.error("Error listening to messages collection:", error);
      });
      
      return () => messagesUnsubscribe();
  }, [db, room.id, messages.length]);


  // Listener for self doc (WebRTC signaling, private messages, alerts)
  React.useEffect(() => {
      if (!db || !auth.currentUser) return;
      
      const selfDocUnsubscribe = onSnapshot(doc(db, `chat_rooms/${room.id}/users/${auth.currentUser.uid}`), async (snapshot) => {
          const data = snapshot.data();
          if (!data) return;

          const me = {id: snapshot.id, ...data} as WithId<User>;
          
          // --- Update Local User State ---
          setUsersInRoom(prevUsers => {
            const index = prevUsers.findIndex(u => u.id === me.id);
            if (index !== -1) {
              const newUsers = [...prevUsers];
              newUsers[index] = me;
              return newUsers;
            }
            return prevUsers;
          });

          // Check for new private messages
          if (me.newPrivateMessageFrom && me.newPrivateMessageFrom.length > 0) {
              const currentUsers = usersInRoom;
              me.newPrivateMessageFrom.forEach(senderName => {
                  const senderUser = currentUsers.find(u => u.name === senderName);
                  if (senderUser && !privateChats.some(pc => pc.id === senderUser.id)) {
                      setPrivateChats(prev => [...prev, senderUser]);
                  }
              });
          }

          // WebRTC Signaling: Handle Offers
          const offers = data.offers;
          if (offers) {
              for (const peerId in offers) {
                  const pc = createPeerConnection(auth.currentUser!.uid, peerId, db, room.id, localStream, (remoteStream) => {
                    setRemoteStreams(prev => ({ ...prev, [peerId]: remoteStream }));
                  });
                  peerConnections.current[peerId] = pc;
                  
                  await pc.setRemoteDescription(offers[peerId]);
                  const answer = await pc.createAnswer();
                  await pc.setLocalDescription(answer);

                  const peerDocRef = doc(db, `chat_rooms/${room.id}/users/${peerId}`);
                  await updateDoc(peerDocRef, { [`answers.${auth.currentUser.uid}`]: { type: 'answer', sdp: answer.sdp } });
                  await updateDoc(snapshot.ref, { [`offers.${peerId}`]: null });
              }
          }
          
          // WebRTC Signaling: Handle Answers
          const answers = data.answers;
          if (answers) {
              for (const peerId in answers) {
                  const pc = peerConnections.current[peerId];
                  if (pc && pc.signalingState !== 'stable') {
                      await pc.setRemoteDescription(answers[peerId]);
                      await updateDoc(snapshot.ref, { [`answers.${peerId}`]: null });
                  }
              }
          }
      }, (error) => {
          console.error("Error listening to self doc:", error);
      });

      return () => {
          selfDocUnsubscribe();
          Object.keys(peerConnections.current).forEach(peerId => closePeerConnection(peerId, peerConnections));
      };
  }, [db, auth.currentUser, room.id, localStream, privateChats, usersInRoom]);


  const handleUserUpdate = async (update: Partial<User>) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, `chat_rooms/${room.id}/users/${auth.currentUser.uid}`);
    try {
        await updateDoc(userRef, update);
    } catch (e) {
        // This might fail if the user was just kicked/disconnected.
        console.warn("Failed to update user. User might be disconnected.", e);
    }
  };

  const handleTypingChange = (isTyping: boolean) => {
    if (activeTab === 'public') {
      handleUserUpdate({ isTyping });
    } else {
      handleUserUpdate({ isTyping: false });
    }
  };
  
 const getMedia = async ({ audio = false, video = false }: { audio?: boolean, video?: boolean }) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video, audio });
      setLocalStream(prevStream => {
          const newCombinedStream = prevStream ? new MediaStream(prevStream.getTracks()) : new MediaStream();
          newStream.getTracks().forEach(track => {
              newCombinedStream.addTrack(track);
          });
          return newCombinedStream;
      });
      return newStream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: 'destructive',
        title: 'Media Access Denied',
        description: 'Camera and/or microphone access is required for this feature.',
      });
      return null;
    }
  };

  const toggleMic = async () => {
    const isVisitorMutedByOwner = currentUserInRoom?.role === 'visitor' && room.muteVisitorsVoice;
    if (isVisitorMutedByOwner) {
        toast({ variant: 'destructive', title: t.room.mic_muted_by_owner_dropdown });
        return;
    }
  
    let stream = localStream;
    let audioTrack: MediaStreamTrack | undefined;

    if (stream) {
        audioTrack = stream.getAudioTracks()[0];
    }
    
    if (!audioTrack) {
        const newAudioStream = await getMedia({ audio: true });
        audioTrack = newAudioStream?.getAudioTracks()[0];
        if (audioTrack) {
          setIsMicEnabled(true);
        }
    }
    
    if (audioTrack) {
        const isCurrentlyMuted = !audioTrack.enabled;
        audioTrack.enabled = isCurrentlyMuted; // Toggle the track's enabled state
        setIsMicEnabled(isCurrentlyMuted);
        handleUserUpdate({ isMuted: !isCurrentlyMuted, isSpeaking: isCurrentlyMuted });
    }
  };

  const toggleCamera = async () => {
    let stream = localStream;
    let videoTrack: MediaStreamTrack | undefined;
    
    if (stream) {
        videoTrack = stream.getVideoTracks()[0];
    }

    if (videoTrack) {
        const isCurrentlyOff = !videoTrack.enabled;
        videoTrack.enabled = isCurrentlyOff;
        handleUserUpdate({ isCameraOn: isCurrentlyOff });
    } else {
        const newVideoStream = await getMedia({ video: true });
        if (newVideoStream) {
            handleUserUpdate({ isCameraOn: true });
        }
    }
  };


  const raiseHand = async () => {
      const currentlyRaised = currentUserInRoom?.handRaised;
      await handleUserUpdate({ handRaised: !currentlyRaised, handRaisedAt: !currentlyRaised ? Date.now() : null, isSpeaking: currentlyRaised ? false : currentUserInRoom?.isSpeaking });
  }
  
  const handleToggleLock = async () => {
    const newLockState = !room.isLocked;
    try {
        await updateRoomSettings(room.id, { isLocked: newLockState });
    } catch (error: any) {
        toast({ variant: "destructive", title: t.ownerPanel.settings.error, description: error.message || t.ownerPanel.settings.updateError });
    }
  }

  const handleSendMessage = async (text: string, color: string) => {
    const isVisitor = currentUserInRoom?.role === 'visitor';
    if (isVisitor && room.muteVisitorsText) {
        toast({ variant: 'destructive', title: "Error", description: t.muted_placeholder });
        return;
    }
    if (!currentUserInRoom) return;
    handleTypingChange(false);
    const newMessage: Omit<Message, 'timestamp'> = {
      userId: currentUserInRoom.id,
      userName: currentUserInRoom.name,
      userRole: currentUserInRoom.role,
      text,
      color,
      type: 'user',
    };
    await addDoc(collection(db, `chat_rooms/${room.id}/messages`), {
        ...newMessage,
        timestamp: serverTimestamp(),
    });
  };

  const handleSendPrivateMessage = async (toId: string, text: string, color: string) => {
    if (!room.isPrivateChatEnabled) {
      toast({ variant: "destructive", title: "Private Chat Disabled", description: "The room owner has disabled private chat." });
      return;
    }

    const targetUser = usersInRoom.find(u => u.id === toId);
    if (targetUser?.dnd) {
      toast({ variant: "destructive", title: t.moderation.userIsDnd, description: `${targetUser.name} is not accepting private messages.` });
      return;
    }

    if (!currentUserInRoom || !toId) return;
    handleTypingChange(false);

    // Create a consistent conversation ID
    const conversationId = [currentUserInRoom.id, toId].sort().join('_');
    const privateMessagesRef = collection(db, 'chat_rooms', room.id, 'privateMessages', conversationId, 'messages');
    
    const pmData: Omit<PrivateMessage, 'id' | 'timestamp'> = {
      fromId: currentUserInRoom.id,
      fromName: currentUserInRoom.name,
      toId: toId,
      text,
      read: false,
      participantIds: [currentUserInRoom.id, toId].sort(),
      color: color,
      fromRole: currentUserInRoom.role,
    };
  
    const recipientUserRef = doc(db, 'chat_rooms', room.id, 'users', toId);

    try {
        await addDoc(privateMessagesRef, { ...pmData, timestamp: serverTimestamp() });
        await updateDoc(recipientUserRef, {
             newPrivateMessageFrom: arrayUnion(currentUserInRoom.name)
        });
    } catch (error: any) {
      console.error("Error sending private message:", error);
      toast({ variant: 'destructive', title: 'Error', description: "Could not send message. Please check permissions and try again." });
    }
  };
  
  const handleStatusChange = async (status: string, statusText?: string) => {
    const updatePayload: Partial<User> = { status: status || null };
    
    if (status === 'custom') {
        updatePayload.statusText = statusText || null;
    } else {
        updatePayload.statusText = null;
    }

    if (currentUserInRoom) {
      await handleUserUpdate(updatePayload);

      if (status !== 'custom' && status !== '') {
          const statusKey = `status_${status}` as keyof typeof t;
          const systemMessageText = t[statusKey] || `is now ${status}`;
          await sendSystemMessage(`${currentUserInRoom.name} ${systemMessageText}`);
      } else if (status === '') {
          await sendSystemMessage(`${currentUserInRoom.name} ${t.status_online}`);
      }
    }
  };
  
  const toggleRoomMute = () => {
    setIsRoomMuted(prev => {
        const newMuteState = !prev;
        Object.values(remoteStreams).forEach(stream => {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !newMuteState; 
            });
        });
        toast({
            title: newMuteState ? t.room.mute_room_toast : t.room.unmute_room_toast,
        });
        return newMuteState;
    });
  };
  
  const openPrivateChat = (user: WithId<User>) => {
    if (user.id === currentUserProfile.id) return;

    if (!privateChats.some(pc => pc.id === user.id)) {
        setPrivateChats(prev => [...prev, user]);
    }
    setActiveTab(user.id);
    
    if(currentUserInRoom?.newPrivateMessageFrom?.includes(user.name)) {
        updateDoc(doc(db, `chat_rooms/${room.id}/users/${currentUserProfile.id}`), { newPrivateMessageFrom: arrayRemove(user.name) });
    }
  }

  const closePrivateChat = (userId: string) => {
    setPrivateChats(prev => prev.filter(pc => pc.id !== userId));
    if (activeTab === userId) {
        setActiveTab('public');
    }
  }

  const isVisitor = currentUserInRoom?.role === 'visitor';
  const isMicMutedByOwner = isVisitor && !!room.muteVisitorsVoice;

  return (
    <div 
        className={cn(
            "flex h-full text-gray-900 dark:text-gray-100 transition-all duration-500 flex-col md:flex-row", 
            lang === 'ar' ? 'md:flex-row-reverse' : 'md:flex-row'
        )} 
        dir={dir}
    >
      
      {!isOnline && <ReconnectingModal />}
      <AlertNotificationDialog
        currentUser={currentUserInRoom}
        onClearAlerts={() => handleUserUpdate({ alerts: [] })}
      />
      <AlertDialog open={isConfirmingClose} onOpenChange={setIsConfirmingClose}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من رغبتك في المغادرة؟</AlertDialogTitle>
                <AlertDialogDescription>
                    سيؤدي هذا إلى تسجيل خروجك من الغرفة.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => onClose()}>تأكيد</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desktop Layout: User list on the side */}
      <div className={cn("hidden md:flex flex-col w-72 backdrop-blur-sm shadow-lg", room.backgroundGradient ? 'bg-black/10' : 'bg-white/70 dark:bg-black/20')}>
        <div className="flex-1 overflow-y-auto">
          <UserList roomId={room.id} users={usersInRoom} micQueue={micQueue} currentUserProfile={currentUserInRoom || currentUserProfile} onUserClick={openPrivateChat} onStartViewingVideo={startViewingVideo} />
        </div>
        <div className={cn("p-2 border-t border-gray-300 dark:border-gray-700 mt-auto flex-shrink-0 backdrop-blur-sm", room.backgroundGradient ? 'bg-black/10' : 'bg-white/30 dark:bg-black/20')}>
          <VolumeMeter stream={localStream} isMicEnabled={isMicEnabled} />
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-1">
              <Sparkles className="w-3 h-3" />
              <span>Ronza4Chat Version 1.0.0</span>
          </div>
        </div>
      </div>
      
      {/* This is the main chat area for both mobile and desktop */}
       <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-transparent">
          {/* Header for mobile */}
          <header className="p-2 md:p-3 border-b bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-md flex justify-between items-center flex-shrink-0 z-20 md:hidden sticky top-0">
              {/* Left Side: Language and User List (mobile) */}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800" title={t.langSwitch} onClick={toggleLanguage}>
                    <Languages className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800" title="Toggle Theme" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                </Button>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden text-gray-600 dark:text-gray-300">
                            <Users2 className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side={lang === 'ar' ? 'right' : 'left'} className={cn("p-0 w-72 flex flex-col", room.backgroundGradient ? `bg-gradient-to-br ${room.backgroundGradient.replace('bg-gradient-to-br ', '')}` : 'bg-white dark:bg-black/80 backdrop-blur-sm')}>
                       <div className="flex-1 overflow-y-auto">
                        <UserList roomId={room.id} users={usersInRoom} micQueue={micQueue} currentUserProfile={currentUserInRoom || currentUserProfile} onUserClick={openPrivateChat} onStartViewingVideo={startViewingVideo}/>
                       </div>
                        <div className="p-2 border-t border-gray-300 dark:border-gray-700 mt-auto flex-shrink-0">
                           <VolumeMeter stream={localStream} isMicEnabled={isMicEnabled} />
                           <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mt-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Ronza4Chat Version 1.0.0</span>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
              </div>

              {/* Center: Room Name */}
              <div className="absolute left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-1 md:px-6 md:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg text-white border-b-2 border-blue-300">
                      <h1 className="text-base md:text-xl font-bold">{room.name}</h1>
                  </div>
              </div>

              {/* Right Side: Close button */}
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title={t.exit} onClick={() => setIsConfirmingClose(true)}>
                  <X className="h-6 w-6" />
              </Button>
          </header>

           {/* Header for desktop */}
            <header className="hidden md:flex p-2 md:p-3 border-b bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm shadow-md justify-between items-center flex-shrink-0 z-20">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800" title={t.langSwitch} onClick={toggleLanguage}>
                        <Languages className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800" title="Toggle Theme" onClick={toggleTheme}>
                        {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                    </Button>
                </div>
                 <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-4 py-1 md:px-6 md:py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg text-white border-b-2 border-blue-300">
                        <h1 className="text-base md:text-xl font-bold">{room.name}</h1>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50" title={t.exit} onClick={() => setIsConfirmingClose(true)}>
                    <X className="h-6 w-6" />
                </Button>
            </header>
          
            <div className="flex flex-col flex-1 min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <TabsList className="m-2 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0">
                        <TabsTrigger value="public" className="rounded-md">{t.publicRooms.everyone}</TabsTrigger>
                        {privateChats.map(chatUser => {
                            const hasNewMessage = currentUserInRoom?.newPrivateMessageFrom?.includes(chatUser.name);
                            return (
                                <TabsTrigger key={chatUser.id} value={chatUser.id} className="relative rounded-md pr-8">
                                    {hasNewMessage && <MessageSquare className="w-4 h-4 text-red-500 absolute left-1 top-1/2 -translate-y-1/2 animate-pulse" />}
                                    <span>{chatUser.name}</span>
                                    <Button variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6" onClick={(e) => { e.stopPropagation(); closePrivateChat(chatUser.id)}}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                    
                    <div className="flex-1 min-h-0">
                        <TabsContent value="public" className="h-full flex-1 -mt-2 min-h-0 flex flex-col">
                            <ChatArea 
                                room={room} 
                                messages={messages}
                                users={usersInRoom} 
                                currentUserId={auth.currentUser?.uid || ''}
                                localStream={localStream}
                                remoteStreams={remoteStreams}
                                roomId={room.id}
                            />
                        </TabsContent>
                        {privateChats.map(chatUser => (
                            <TabsContent forceMount key={chatUser.id} value={chatUser.id} className="h-full flex-1 -mt-2 min-h-0 flex flex-col">
                            <PrivateChatArea 
                                    roomId={room.id}
                                    currentUser={currentUserInRoom || currentUserProfile}
                                    targetUser={chatUser}
                                    db={db}
                                />
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
                <ChatInput
                    onSendMessage={handleSendMessage}
                    onSendPrivateMessage={handleSendPrivateMessage}
                    onStatusChange={handleStatusChange}
                    onTypingChange={handleTypingChange}
                    disabled={isVisitor && !!room.muteVisitorsText}
                    onMicToggle={toggleMic}
                    onCameraToggle={toggleCamera}
                    onHandRaise={raiseHand}
                    onRoomLockToggle={handleToggleLock}
                    isMicMutedByOwner={isMicMutedByOwner}
                    me={currentUserInRoom}
                    onRoomMuteToggle={toggleRoomMute}
                    isRoomMuted={isRoomMuted}
                    isRoomLocked={room.isLocked}
                    activeTab={activeTab}
                />
            </div>
      </main>
    </div>
  );
}

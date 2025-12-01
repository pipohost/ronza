

'use server';

import { cookies, headers } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getRoomById, getRoomMembers, getColoredNames } from '@/lib/server-data';
import type { Room, User, WithId, RegisteredMember, ReservedName, VisitorLog, BannedUser, UserRole, CosmeticRank } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { serializeTimestamps } from '@/lib/utils';
import translations from '@/lib/translations.json';

interface JoinRoomParams {
    idToken: string;
    roomId: string;
    userName: string;
    avatarUrl: string;
    avatarColor: string;
    deviceId: string;
    password?: string;
    lang: 'ar' | 'en';
}

export async function joinRoom(params: JoinRoomParams): Promise<WithId<User>> {
    const { idToken, roomId, userName, avatarUrl, avatarColor, deviceId, lang = 'ar' } = params;
    const t = translations[lang].joinErrors;

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    let sessionCookie;
    try {
        sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        cookies().set('__session', sessionCookie, {
          maxAge: expiresIn / 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'lax',
        });
    } catch (error: any) {
         throw new Error(`Authentication error: Could not create session. ${error.message}`);
    }
    
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const room = await getRoomById(roomId);
    if (!room) {
        throw new Error("Room not found.");
    }
    if (room.isLocked) {
        throw new Error(t.roomLocked);
    }
    
    const usersInRoomRef = adminDb.collection('chat_rooms').doc(roomId).collection('users');
    
    // Check if device is already in the room
    const deviceQuery = await usersInRoomRef.where('deviceId', '==', deviceId).limit(1).get();
    if (!deviceQuery.empty) {
        const existingUser = deviceQuery.docs[0].data() as User;
        // Allow re-entry if the user ID matches (it's a reconnection), otherwise block.
        if (deviceQuery.docs[0].id !== userId) {
            throw new Error(t.alreadyInThisRoom);
        }
    }
    
    const usersSnapshot = await usersInRoomRef.get();
    if (usersSnapshot.size >= room.maxUsers) {
        throw new Error(t.roomFull);
    }
    
    const globalBanDoc = await adminDb.collection('global_bans').doc(userId).get();
    if (globalBanDoc.exists) {
        throw new Error(t.banned);
    }
    
    const userInRoomDoc = await usersInRoomRef.doc(userId).get();
    if (userInRoomDoc.exists) {
        const existingUser = { id: userId, ...userInRoomDoc.data() } as WithId<User>;
        await userInRoomDoc.ref.update({ lastSeen: FieldValue.serverTimestamp() });
        return serializeTimestamps(existingUser);
    }


    const bannedUsersCollection = adminDb.collection('chat_rooms').doc(roomId).collection('bannedUsers');
    const banDoc = await bannedUsersCollection.doc(userId).get();
    if (banDoc.exists) {
        throw new Error(t.banned);
    }

    const deviceBanQuery = await bannedUsersCollection.where('deviceId', '==', deviceId).get();
    if (!deviceBanQuery.empty) {
        throw new Error(t.banned);
    }

    if (!userName.trim()) {
      throw new Error("Name cannot be empty.");
    }
    
    let userProfile: Omit<User, 'id'> | null = null;
    let password = params.password;

    const allReservedNames = await getColoredNames();
    const members = await getRoomMembers(roomId);
    
    const lowerCaseUserName = userName.toLowerCase();

    // Priority 1: Check for a matching reserved name (global or reseller-specific)
    const reservedNameInfo = allReservedNames.find(n => n.name.toLowerCase() === lowerCaseUserName);

    if (reservedNameInfo) {
        if (reservedNameInfo.password && reservedNameInfo.password !== password) {
            throw new Error("Incorrect password for this reserved name.");
        }
        
        let backgroundUrl: string | null = null;
        if (reservedNameInfo.cosmeticRank === 'mythical_admin') {
            const seed = Math.floor(Math.random() * 1000);
            backgroundUrl = `https://picsum.photos/seed/${seed}/400/200`;
        }

        // This is a valid reserved name user
        userProfile = {
           name: reservedNameInfo.name,
           avatarUrl,
           avatarColor,
           deviceId,
           role: reservedNameInfo.role || 'visitor',
           cosmeticRole: reservedNameInfo.cosmeticRank || null,
           isMuted: false,
           isCameraOn: false, isSpeaking: false, handRaised: false, handRaisedAt: null, newPrivateMessageFrom: [], status: 'online', alerts: [],
           micTimeStarted: null, hasOpenMic: false,
           isTyping: false,
           backgroundUrl,
           statusText: null,
       };
    } else {
        // Priority 2: Check for a room-specific registered member
        const registeredMember = members.find(m => m.name.toLowerCase() === lowerCaseUserName);

        if (registeredMember) {
            if (registeredMember.password && registeredMember.password !== password) {
                throw new Error("Incorrect password for this registered name.");
            }
            
            let backgroundUrl: string | null = null;
            if ((registeredMember as any).cosmeticRank === 'mythical_admin') {
                const seed = Math.floor(Math.random() * 1000);
                backgroundUrl = `https://picsum.photos/seed/${seed}/400/200`;
            }

            // This is a valid registered member for this room
            userProfile = {
                name: registeredMember.name,
                avatarUrl,
                avatarColor,
                deviceId,
                role: registeredMember.role,
                cosmeticRole: (registeredMember as any).cosmeticRank || null,
                isMuted: false, 
                isCameraOn: false, isSpeaking: false, handRaised: false, handRaisedAt: null, newPrivateMessageFrom: [], status: 'online', alerts: [],
                micTimeStarted: null, hasOpenMic: false,
                isTyping: false,
                backgroundUrl,
                statusText: null,
            };
        }
    }

    // Priority 3: If no reserved or registered name matched, treat as a regular visitor
    if (!userProfile) {
        // Still need to check if the chosen name is simple-reserved by the room owner
        if (room.reservedNames?.some(n => n.toLowerCase() === lowerCaseUserName)) {
             throw new Error("This name is reserved in this room. Please choose another name.");
        }
        // This is a regular visitor
        userProfile = {
            name: userName,
            avatarUrl,
            avatarColor,
            deviceId,
            role: 'visitor',
            cosmeticRole: null,
            isMuted: room.muteVisitorsVoice || false,
            isCameraOn: false, isSpeaking: false, handRaised: false, handRaisedAt: null, newPrivateMessageFrom: [], status: 'online', alerts: [],
            micTimeStarted: null, hasOpenMic: false,
            isTyping: false,
            backgroundUrl: null,
            statusText: null,
        };
    }
    
    const persistentUserDoc = await adminDb.collection('chat_rooms').doc(roomId).collection('persistent_users').doc(userId).get();
    const persistedData = persistentUserDoc.data();
    if (persistedData && typeof persistedData.isMuted === 'boolean') {
        userProfile.isMuted = persistedData.isMuted;
    }

    const finalUserProfile: User = {
        ...userProfile,
        lastSeen: FieldValue.serverTimestamp(),
    };

    const roomDocRef = adminDb.collection('chat_rooms').doc(roomId);

    await adminDb.runTransaction(async (transaction) => {
        const roomDoc = await transaction.get(roomDocRef);
        if (!roomDoc.exists) {
            throw new Error("Room does not exist.");
        }
        
        // Re-check room capacity within the transaction for consistency
        const currentUsersSnapshot = await transaction.get(roomDocRef.collection('users'));
        if (currentUsersSnapshot.size >= roomDoc.data()?.maxUsers) {
            throw new Error(t.roomFull);
        }

        transaction.set(userInRoomDoc.ref, finalUserProfile);
        transaction.update(roomDocRef, { userCount: FieldValue.increment(1) });
        

        if (roomDoc.data()?.showJoinLeaveMessages) {
             const messageRef = roomDocRef.collection('messages').doc();
             transaction.set(messageRef, {
                 userId: 'system',
                 userName: 'System',
                 userRole: 'visitor',
                 text: `${finalUserProfile.name} has joined the room.`,
                 color: '#888888',
                 type: 'status',
                 timestamp: FieldValue.serverTimestamp(),
             });
        }
        
        // Capture IP and location
        const headerList = headers();
        const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() || 'N/A';
        const country = headerList.get('x-vercel-ip-country') || 'N/A';
        const city = headerList.get('x-vercel-ip-city') || 'N/A';
        
        const visitorLogRef = adminDb.collection('visitor_logs').doc();
        const logEntry: VisitorLog = {
            userId: userId,
            userName: finalUserProfile.name,
            userAvatar: finalUserProfile.avatarUrl,
            roomId: roomId,
            roomName: room.name,
            ownerId: room.ownerId,
            timestamp: FieldValue.serverTimestamp(),
            ipAddress: ip,
            country: country,
            city: city,
        };
        transaction.set(visitorLogRef, logEntry);

    });

    // Final sanitization before returning to client
    const userToReturn = { ...finalUserProfile, id: userId };
    return serializeTimestamps(userToReturn);
}

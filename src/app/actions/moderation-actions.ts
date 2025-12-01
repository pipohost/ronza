
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { checkAuth } from '@/lib/auth-check';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import type { User, Message, UserRole, Alert } from '@/lib/types';
import { leaveRoom } from './user-leave';

/**
 * Logs out a user and deletes their document from the room's user list.
 * This is a moderator action (kick).
 * @param roomId The ID of the room.
 * @param userId The ID of the user to log out.
 */
export async function logoutUser(roomId: string, userId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    if (!roomId || !userId) {
        console.error("Room ID and User ID are required for logout.");
        return;
    }
    const userDocRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(userId);
    const targetUserDoc = await userDocRef.get();
    
    if (targetUserDoc.exists && targetUserDoc.data()?.cosmeticRole === 'mythical_admin') {
        throw new Error("Cannot kick a Mythical Admin.");
    }
    if (targetUserDoc.exists && (moderator.role !== 'superadmin' && moderator.cosmeticRole !== 'mythical_admin') && (targetUserDoc.data()?.role === 'superadmin' || targetUserDoc.data()?.role === 'admin')) {
        throw new Error("You do not have permission to kick this user.");
    }

    // Use the generic leaveRoom function to handle the actual removal
    await leaveRoom(roomId, userId, { kicked: true, moderatorName: moderator.name });

    revalidatePath(`/chat-room/${roomId}`);
    console.log(`User ${userId} successfully kicked from room ${roomId} by ${moderator.name}.`);
}


/**
 * Deletes a message from a room and logs the action.
 * Only accessible by moderators.
 * @param roomId The ID of the room.
 * @param messageId The ID of the message to delete.
 */
export async function deleteMessage(roomId: string, messageId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    const messageRef = adminDb.collection('chat_rooms').doc(roomId).collection('messages').doc(messageId);
    
    // Create a new system message to log the deletion
    const systemMessageRef = adminDb.collection('chat_rooms').doc(roomId).collection('messages').doc();
    const systemMessage = {
        userId: 'system',
        userName: 'System',
        userRole: 'visitor',
        text: `Message deleted by ${moderator.name}`,
        color: '#888888',
        type: 'status',
        timestamp: FieldValue.serverTimestamp(),
    };

    // Use a batch to delete the old message and add the new one atomically
    const batch = adminDb.batch();
    batch.delete(messageRef);
    batch.set(systemMessageRef, systemMessage);

    await batch.commit();

    // No revalidation needed as Firestore listeners will pick up the change.
}


/**
 * Bans a user from a specific room.
 * @param roomId The ID of the room.
 * @param targetUserId The ID of the user to ban.
 * @param deviceId The device ID of the user to ban.
 * @param reason The reason for the ban.
 */
export async function banUser(roomId: string, targetUserId: string, deviceId: string, reason: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    const roomRef = adminDb.collection('chat_rooms').doc(roomId);
    const targetUserRef = roomRef.collection('users').doc(targetUserId);
    const targetUserDoc = await targetUserRef.get();
    
    if (!targetUserDoc.exists) {
        throw new Error("Target user not found in the room.");
    }
    const targetUserData = targetUserDoc.data() as User;

     // Immunity checks
    if (targetUserData.cosmeticRole === 'mythical_admin') {
        throw new Error("You cannot ban a Mythical Admin.");
    }
    if (moderator.role !== 'superadmin' && moderator.cosmeticRole !== 'mythical_admin' && (targetUserData.role === 'superadmin' || targetUserData.role === 'admin')) {
         throw new Error("You do not have permission to ban this user.");
    }

    // Add to banned list
    await roomRef.collection('bannedUsers').doc(targetUserId).set({
        name: targetUserData.name,
        deviceId: deviceId,
        reason: reason || "No reason provided.",
        bannedBy: moderator.name,
        bannedAt: FieldValue.serverTimestamp(),
    });
    
    // Kick the user (without re-checking auth)
    await leaveRoom(roomId, targetUserId, { banned: true, moderatorName: moderator.name });

    // Log the action
    await adminDb.collection('chat_rooms').doc(roomId).update({
        activityLog: FieldValue.arrayUnion(`[Ban] User '${targetUserData.name}' banned by moderator '${moderator.name}'. Reason: ${reason}`)
    });

    revalidatePath(`/owner-panel/${roomId}`);
}

/**
 * Mutes a user's text chat in a specific room. The mute state is persisted.
 * @param roomId The ID of the room.
 * @param targetUserId The ID of the user to mute.
 */
export async function muteUser(roomId: string, targetUserId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    const userRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        throw new Error("Target user not found in the room.");
    }
    const targetUserData = userDoc.data() as User;
    
    // Immunity checks
    if (targetUserData.cosmeticRole === 'mythical_admin') {
        throw new Error("You cannot mute a Mythical Admin.");
    }
    if (moderator.role !== 'superadmin' && moderator.cosmeticRole !== 'mythical_admin' && (targetUserData.role === 'superadmin' || targetUserData.role === 'admin')) {
        throw new Error("You do not have permission to mute this user.");
    }


    const currentMuteStatus = userDoc.data()?.isMuted || false;
    const newMuteStatus = !currentMuteStatus;
    
    // Update live user document
    await userRef.update({ isMuted: newMuteStatus, isSpeaking: false });

    // Persist the mute state
    const persistentUserRef = adminDb.collection('chat_rooms').doc(roomId).collection('persistent_users').doc(targetUserId);
    await persistentUserRef.set({ isMuted: newMuteStatus }, { merge: true });


     // Log the action
    await adminDb.collection('chat_rooms').doc(roomId).update({
        activityLog: FieldValue.arrayUnion(`[Mute] User '${targetUserData.name}' voice mute status set to ${newMuteStatus} by moderator '${moderator.name}'.`)
    });

    revalidatePath(`/owner-panel/${roomId}`);
}

/**
 * Grants unlimited microphone time to a user.
 * @param roomId The ID of the room.
 * @param targetUserId The ID of the user to grant open mic to.
 */
export async function grantOpenMic(roomId: string, targetUserId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    const targetUserRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    const targetUserDoc = await targetUserRef.get();

    if (!targetUserDoc.exists) {
        throw new Error("Target user not found in the room.");
    }

    const targetUserData = targetUserDoc.data() as User;

    await targetUserRef.update({ hasOpenMic: !targetUserData.hasOpenMic });

    // Add a system message to inform the room
    const systemMessage: Omit<Message, 'timestamp'> = {
        userId: 'system',
        userName: 'System',
        userRole: 'visitor',
        text: `قام ${moderator.name} بمنح وقت مفتوح للمستخدم ${targetUserData.name}`,
        color: '#888888',
        type: 'status',
    };
    await adminDb.collection('chat_rooms').doc(roomId).collection('messages').add({
        ...systemMessage,
        timestamp: FieldValue.serverTimestamp(),
    });
}


/**
 * Sends a public announcement to the room.
 */
export async function sendPublicAnnouncement(roomId: string, message: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['superadmin']);

    if (!message.trim()) {
        throw new Error("Announcement message cannot be empty.");
    }

    const announcement: Omit<Message, 'timestamp'> = {
        userId: moderator.id,
        userName: `📢 ${moderator.name}`,
        userRole: moderator.role,
        text: message,
        color: '#f59e0b', // Amber color for announcements
        type: 'user',
    };
    
    await adminDb.collection('chat_rooms').doc(roomId).collection('messages').add({
        ...announcement,
        timestamp: FieldValue.serverTimestamp(),
    });
    
    revalidatePath(`/chat-room/${roomId}`);
}

/**
 * Sends a private, dismissible alert to a specific user.
 * @param roomId The ID of the room.
 * @param targetUserId The ID of the user to send the alert to.
 * @param message The alert message.
 */
export async function sendUserAlert(roomId: string, targetUserId: string, message: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['special', 'admin', 'superadmin']);

    if (!message.trim()) {
        throw new Error("Alert message cannot be empty.");
    }

    const targetUserRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    
    await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(targetUserRef);
        if (!userDoc.exists) {
            throw new Error("User not found.");
        }
        
        const userData = userDoc.data() as User;
        const currentAlerts: Alert[] = userData.alerts || [];

        const newAlert: Alert = {
            fromName: moderator.name,
            text: message,
            timestamp: FieldValue.serverTimestamp(), // Will be resolved on the server
        };

        const updatedAlerts = [...currentAlerts, newAlert];

        transaction.update(targetUserRef, {
            alerts: updatedAlerts
        });
    });
}


export async function toggleUserRole(roomId: string, targetUserId: string): Promise<void> {
    // This action is exclusively for Mythical Admins
    const { moderator } = await checkAuth(roomId, []); // Auth check to get moderator, but no role required here as it's checked below
    if (moderator.cosmeticRole !== 'mythical_admin') {
        throw new Error("Only a Mythical Admin can perform this action.");
    }

    const userRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
        throw new Error("Target user not found in the room.");
    }

    const userData = userDoc.data() as User;
    
    // Mythical admins are immune to this action
    if (userData.cosmeticRole === 'mythical_admin') {
         throw new Error("Cannot strip roles from another Mythical Admin.");
    }

    if (userData.isRoleStripped) {
        // Restore role
        await userRef.update({
            role: userData.originalRole || 'visitor',
            originalRole: null,
            isRoleStripped: false,
        });
    } else {
        // Strip role
        await userRef.update({
            originalRole: userData.role,
            role: 'visitor',
            isRoleStripped: true,
        });
    }
}


// --- New Super/Mythical Admin Actions ---

export async function forceMicDrop(roomId: string, targetUserId: string): Promise<void> {
    await checkAuth(roomId, ['superadmin']);
    const targetUserRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    await targetUserRef.update({ isSpeaking: false, micTimeStarted: null, handRaised: false, handRaisedAt: null });
}

export async function forceMicDropAll(roomId: string): Promise<void> {
    const { moderatorId } = await checkAuth(roomId, ['superadmin']);
    const usersRef = adminDb.collection('chat_rooms').doc(roomId).collection('users');
    const speakingUsersSnapshot = await usersRef.where('isSpeaking', '==', true).get();

    if (speakingUsersSnapshot.empty) return;

    const batch = adminDb.batch();
    speakingUsersSnapshot.forEach(doc => {
        if (doc.id !== moderatorId) {
            batch.update(doc.ref, { isSpeaking: false, micTimeStarted: null, handRaised: false, handRaisedAt: null });
        }
    });
    await batch.commit();
}

export async function toggleDnd(roomId: string): Promise<void> {
    const { moderator, moderatorId } = await checkAuth(roomId, ['superadmin']);
    const userRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(moderatorId);
    const currentDndStatus = moderator.dnd || false;
    await userRef.update({ dnd: !currentDndStatus });
}

export async function clearChat(roomId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['superadmin']);
    const messagesRef = adminDb.collection('chat_rooms').doc(roomId).collection('messages');
    const snapshot = await messagesRef.get();

    if (snapshot.empty) return;

    const batch = adminDb.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    // Add a system message indicating the chat was cleared
    const systemMessageRef = messagesRef.doc();
    batch.set(systemMessageRef, {
        userId: 'system',
        userName: 'System',
        userRole: 'visitor',
        text: `Chat cleared by ${moderator.name}`,
        color: '#888888',
        type: 'status',
        timestamp: FieldValue.serverTimestamp(),
    });

    await batch.commit();
}

export async function grantCohost(roomId: string, targetUserId: string): Promise<void> {
    const { moderator } = await checkAuth(roomId, ['superadmin']);
    const targetUserRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(targetUserId);
    const targetUserDoc = await targetUserRef.get();
    if (!targetUserDoc.exists) {
        throw new Error("Target user not found in the room.");
    }
    const canSpeakWithOthers = targetUserDoc.data()?.canSpeakWithOthers || false;
    await targetUserRef.update({ canSpeakWithOthers: !canSpeakWithOthers });

     const systemMessage: Omit<Message, 'timestamp'> = {
        userId: 'system',
        userName: 'System',
        userRole: 'visitor',
        text: !canSpeakWithOthers ? `تم منح ${targetUserDoc.data()?.name} صلاحية التحدث مع الآخرين.` : `تم سحب صلاحية التحدث مع الآخرين من ${targetUserDoc.data()?.name}.`,
        color: '#888888',
        type: 'status',
    };
    await adminDb.collection('chat_rooms').doc(roomId).collection('messages').add({
        ...systemMessage,
        timestamp: FieldValue.serverTimestamp(),
    });
}

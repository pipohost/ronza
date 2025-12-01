
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { User } from '@/lib/types';

interface LeaveOptions {
    kicked?: boolean;
    banned?: boolean;
    moderatorName?: string;
}

/**
 * Handles a user leaving a room, either voluntarily or by being kicked/banned.
 * This action does NOT check for moderator permissions.
 * @param roomId The ID of the room.
 * @param userId The ID of the user to remove.
 * @param options Options for different leave scenarios.
 */
export async function leaveRoom(roomId: string, userId: string, options: LeaveOptions = {}): Promise<void> {
    if (!roomId || !userId) {
        console.error("Room ID and User ID are required to leave.");
        return;
    }

    const userDocRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(userId);
    const roomRef = adminDb.collection('chat_rooms').doc(roomId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists) {
                // User already gone, do nothing.
                return;
            }
            
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) return;
            
            const userData = userDoc.data() as User;
            const userName = userData?.name || 'A user';

            // 1. Delete the user from the 'users' subcollection
            transaction.delete(userDocRef);

            // 2. Decrement user count only if they were actually in the room
            const currentCount = roomDoc.data()?.userCount || 0;
            if (currentCount > 0) {
                transaction.update(roomRef, { userCount: FieldValue.increment(-1) });
            }
            
            // 3. Add a system message if enabled
            if(roomDoc.data()?.showJoinLeaveMessages) {
                let text = `${userName} has left the room.`;
                if (options.kicked) {
                    text = `${userName} was kicked by ${options.moderatorName}.`;
                } else if (options.banned) {
                    text = `${userName} was banned by ${options.moderatorName}.`;
                }

                const messageRef = roomRef.collection('messages').doc();
                transaction.set(messageRef, {
                    userId: 'system',
                    userName: 'System',
                    userRole: 'visitor',
                    text,
                    color: '#888888',
                    type: 'status',
                    timestamp: FieldValue.serverTimestamp(),
                });
            }
        });
        
        revalidatePath(`/chat-room/${roomId}`);
        console.log(`User ${userId} successfully removed from room ${roomId}.`);

    } catch (error: any) {
        console.error(`Error removing user ${userId} from room ${roomId}:`, error);
        // We don't re-throw here to avoid crashing serverless functions, especially for beacon calls.
    }
}


'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

type ReactionType = 'heart' | 'star';
type ActionType = 'add' | 'remove';

export async function addOrRemoveReaction(roomId: string, deviceId: string, type: ReactionType, action: ActionType): Promise<void> {
    if (!roomId || !deviceId || !type || !action) {
        throw new Error('Missing required parameters for reaction.');
    }

    const roomRef = adminDb.collection('chat_rooms').doc(roomId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const roomDoc = await transaction.get(roomRef);
            if (!roomDoc.exists) {
                throw new Error("Room not found.");
            }

            const countField = type === 'heart' ? 'heartCount' : 'starCount';
            const usersField = type === 'heart' ? 'heartUsers' : 'starUsers';
            const currentCount = roomDoc.data()?.[countField] || 0;
            const userList: string[] = roomDoc.data()?.[usersField] || [];

            if (action === 'add') {
                if (userList.includes(deviceId)) {
                    // User has already reacted, do nothing to prevent duplicate counts
                    return;
                }
                transaction.update(roomRef, {
                    [countField]: FieldValue.increment(1),
                    [usersField]: FieldValue.arrayUnion(deviceId)
                });
            } else { // action === 'remove'
                if (!userList.includes(deviceId)) {
                    // User hasn't reacted, do nothing to prevent negative counts
                    return;
                }
                 transaction.update(roomRef, {
                    [countField]: FieldValue.increment(-1),
                    [usersField]: FieldValue.arrayRemove(deviceId)
                });
            }
        });
        
        // Revalidate the home page to show updated counts
        revalidatePath('/');
        
    } catch (error: any) {
        console.error(`Failed to ${action} ${type} reaction for room ${roomId}:`, error);
        throw new Error(`Could not update reaction. Please try again.
Error: ${error.message}`);
    }
}

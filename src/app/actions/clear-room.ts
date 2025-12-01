
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';

export async function clearRoomUsers(roomId: string): Promise<void> {
    if (!roomId) {
        throw new Error("Room ID is required to clear users.");
    }

    const roomRef = adminDb.collection('chat_rooms').doc(roomId);
    const usersCollectionRef = roomRef.collection('users');

    try {
        const usersSnapshot = await usersCollectionRef.get();
        if (usersSnapshot.empty) {
            // If no users are in the collection, just reset the count.
            await roomRef.update({ userCount: 0 });
            revalidatePath('/');
            revalidatePath(`/admin`);
            return;
        }

        const batch = adminDb.batch();

        usersSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Reset the user count on the room document
        batch.update(roomRef, { userCount: 0 });

        await batch.commit();

        // Revalidate paths to update UI
        revalidatePath('/');
        revalidatePath(`/admin`);
        revalidatePath(`/reseller-panel/`); // Revalidate all reseller panels
        revalidatePath(`/owner-panel/${roomId}`);
        
    } catch (error: any) {
        console.error(`Failed to clear users for room ${roomId}:`, error);
        throw new Error(`Could not clear users. Please try again. Error: ${error.message}`);
    }
}

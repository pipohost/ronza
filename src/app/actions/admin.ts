'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import type { VisitorLog } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import type admin from 'firebase-admin';

/**
 * Creates a session cookie for the authenticated user.
 * This is a secure, server-side action.
 * @param idToken The Firebase ID token from the client.
 * @returns An object indicating success or failure.
 */
export async function createAdminSessionAction(idToken: string): Promise<{ success: boolean; message?: string }> {
    try {
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        cookies().set('__session', sessionCookie, {
            maxAge: expiresIn / 1000, // maxAge is in seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error creating session cookie:', error);
        return { success: false, message: 'Could not create session. Please try again.' };
    }
}

/**
 * Clears the session cookie to sign the user out.
 */
export async function signOutAdminAction(): Promise<void> {
    cookies().delete('__session');
}

/**
 * Deletes all documents in the visitor_logs collection.
 * Can optionally be filtered by ownerId for resellers.
 */
export async function clearVisitorLogs(ownerId?: string): Promise<{ success: true } | { error: string }> {
    try {
        let query: admin.firestore.Query = adminDb.collection('visitor_logs');
        if (ownerId) {
            query = query.where('ownerId', '==', ownerId);
        }

        const snapshot = await query.get();
        if (snapshot.empty) {
            return { success: true };
        }

        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        revalidatePath('/admin');
        if (ownerId) {
            revalidatePath(`/reseller-panel/${ownerId}`);
        }
        
        return { success: true };

    } catch (error: any) {
        console.error('Error clearing visitor logs:', error);
        return { error: 'Failed to clear visitor logs.' };
    }
}

/**
 * Toggles the global ban status for a user.
 * @param userLog The visitor log entry of the user to ban/unban.
 * @param isCurrentlyBanned The current ban status of the user.
 */
export async function toggleGlobalBan(userLog: VisitorLog, isCurrentlyBanned: boolean): Promise<{ success: boolean; error?: string }> {
    if (!userLog.userId || !userLog.userName) {
        return { success: false, error: "Invalid user data provided." };
    }

    const banRef = adminDb.collection('global_bans').doc(userLog.userId);

    try {
        if (isCurrentlyBanned) {
            // Unban the user
            await banRef.delete();
        } else {
            // Ban the user
            await banRef.set({
                userName: userLog.userName,
                bannedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        revalidatePath('/admin');
        revalidatePath(`/reseller-panel/${userLog.ownerId}`);
        return { success: true };
    } catch (error: any) {
        console.error(`Error toggling global ban for user ${userLog.userId}:`, error);
        return { success: false, error: 'Failed to update global ban status.' };
    }
}


export async function sendBulkAnnouncement(message: string, ownerId: string): Promise<{ success: boolean; error?: string }> {
    if (!message || !ownerId) {
        return { success: false, error: 'Message and owner ID are required.' };
    }
    
    try {
        const roomsQuery = adminDb.collection('chat_rooms').where('ownerId', '==', ownerId);
        const roomsSnapshot = await roomsQuery.get();

        if (roomsSnapshot.empty) {
            return { success: false, error: 'No rooms found for this owner.' };
        }

        const isRootAdmin = ownerId === 'root';

        const announcement = {
            userId: 'system',
            userName: `📢 ${isRootAdmin ? 'الإدارة العامة' : 'إدارة الريسلر'}`,
            userName_en: `📢 ${isRootAdmin ? 'General Administration' : 'Reseller Management'}`,
            userRole: 'superadmin',
            text: message,
            color: '#f59e0b', // Amber color for announcements
            type: 'user',
            timestamp: FieldValue.serverTimestamp(),
        };

        const batch = adminDb.batch();

        roomsSnapshot.docs.forEach(roomDoc => {
            const messagesRef = roomDoc.ref.collection('messages').doc();
            batch.set(messagesRef, announcement);
        });

        await batch.commit();

        return { success: true };

    } catch (error: any) {
        console.error(`Error sending bulk announcement for owner ${ownerId}:`, error);
        return { success: false, error: error.message || 'Failed to send announcement.' };
    }
}

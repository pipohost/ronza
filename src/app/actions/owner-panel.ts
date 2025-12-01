
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import type { Room, RegisteredMember, WithId, Message } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { cookies } from 'next/headers';

// --- General Settings ---
export async function updateRoomSettings(roomId: string, data: Partial<Room>): Promise<void> {
    if (!roomId) {
        throw new Error('Room ID is required.');
    }
    
    const updateData = { ...data };
    delete (updateData as any).renewalDate;

    await adminDb.collection('chat_rooms').doc(roomId).update(updateData);
    
    revalidatePath(`/owner-panel/${roomId}`);
}


export async function updatePanelPassword(roomId: string, newPassword: string): Promise<void> {
    if (!roomId) {
        throw new Error('Room ID is required.');
    }
    if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
    }
    
    await adminDb.collection('chat_rooms').doc(roomId).update({
        ownerPanelPassword: newPassword,
    });
    revalidatePath(`/owner-panel/${roomId}`);
}

// --- Member Management ---
const memberSchema = z.object({
  name: z.string().min(2),
  role: z.enum(['visitor', 'special', 'admin', 'superadmin']),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  password: z.string().optional(),
});

export async function addRoomMember(roomId: string, memberData: z.infer<typeof memberSchema>): Promise<void> {
    if (!roomId) throw new Error('Room ID is required.');
    
    const validatedData = memberSchema.parse(memberData);
    
    await adminDb.collection('chat_rooms').doc(roomId).collection('registeredMembers').add({
        ...validatedData,
    });

    revalidatePath(`/owner-panel/${roomId}`);
}

export async function updateRoomMember(roomId: string, memberId: string, memberData: Partial<RegisteredMember>): Promise<void> {
    if (!roomId || !memberId) throw new Error('Room and Member ID are required.');
    
    const partialMemberSchema = memberSchema.partial();
    const validatedData = partialMemberSchema.parse(memberData);

    await adminDb.collection('chat_rooms').doc(roomId).collection('registeredMembers').doc(memberId).update(validatedData);
    revalidatePath(`/owner-panel/${roomId}`);
}

export async function deleteRoomMember(roomId: string, memberId: string): Promise<void> {
    if (!roomId || !memberId) throw new Error('Room and Member ID are required.');

    await adminDb.collection('chat_rooms').doc(roomId).collection('registeredMembers').doc(memberId).delete();
    revalidatePath(`/owner-panel/${roomId}`);
}


// --- Security Actions ---
export async function unbanUser(roomId: string, userId: string): Promise<void> {
    if (!roomId || !userId) {
        throw new Error('Room and User ID are required.');
    }
    await adminDb.collection('chat_rooms').doc(roomId).collection('bannedUsers').doc(userId).delete();
    revalidatePath(`/owner-panel/${roomId}`);
}

// --- Moderation Actions ---
export async function sendAnnouncement(roomId: string, message: string): Promise<void> {
    if (!roomId) throw new Error('Room ID is required.');
    if (!message.trim()) throw new Error('Message cannot be empty.');
    
    const announcement: Omit<Message, 'timestamp'> = {
        userId: 'owner',
        userName: '📢 Room Owner',
        userRole: 'superadmin',
        text: message,
        color: '#f59e0b', // Amber color for announcements
        type: 'user',
    };
    
    await adminDb.collection('chat_rooms').doc(roomId).collection('messages').add({
        ...announcement,
        timestamp: FieldValue.serverTimestamp(),
    });

    revalidatePath(`/owner-panel/${roomId}`);
}

export async function addFilteredWord(roomId: string, word: string): Promise<void> {
    if (!roomId || !word) throw new Error('Room ID and word are required.');
    await adminDb.collection('chat_rooms').doc(roomId).update({
        wordFilter: FieldValue.arrayUnion(word.toLowerCase())
    });
    revalidatePath(`/owner-panel/${roomId}`);
}

export async function removeFilteredWord(roomId: string, word: string): Promise<void> {
    if (!roomId || !word) throw new Error('Room ID and word are required.');
    await adminDb.collection('chat_rooms').doc(roomId).update({
        wordFilter: FieldValue.arrayRemove(word.toLowerCase())
    });
    revalidatePath(`/owner-panel/${roomId}`);
}

export async function addReservedNameToRoom(roomId: string, name: string): Promise<void> {
    if (!roomId || !name) throw new Error('Room ID and name are required.');
    await adminDb.collection('chat_rooms').doc(roomId).update({
        reservedNames: FieldValue.arrayUnion(name)
    });
    revalidatePath(`/owner-panel/${roomId}`);
}

export async function removeReservedNameFromRoom(roomId: string, name: string): Promise<void> {
    if (!roomId || !name) throw new Error('Room ID and name are required.');
    await adminDb.collection('chat_rooms').doc(roomId).update({
        reservedNames: FieldValue.arrayRemove(name)
    });
    revalidatePath(`/owner-panel/${roomId}`);
}

// --- Authentication ---
export async function verifyOwnerPanelPassword(roomName: string, passwordAttempt: string, idToken: string): Promise<{ success: boolean; roomId?: string; message?: string }> {
    if (!roomName || !passwordAttempt || !idToken) {
        return { success: false, message: 'اسم الغرفة وكلمة المرور ومصادقة العميل مطلوبة.' };
    }
    
    try {
        const trimmedRoomName = roomName.trim().toLowerCase();
        const roomsRef = adminDb.collection('chat_rooms');
        const snapshot = await roomsRef.get();

        if (snapshot.empty) {
            return { success: false, message: 'لم يتم العثور على أي غرف.' };
        }
        
        let roomDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined;
        snapshot.forEach(doc => {
            if (doc.data().name.toLowerCase() === trimmedRoomName) {
                roomDoc = doc;
            }
        });


        if (!roomDoc) {
            return { success: false, message: 'لم يتم العثور على الغرفة.' };
        }

        const roomData = roomDoc.data() as Room;
        const roomId = roomDoc.id;

        if (roomData.ownerPanelPassword === passwordAttempt) {
            // Use the idToken from the client to create a session cookie
            const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day
            const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

            cookies().set(`__session_owner_${roomId}`, sessionCookie, {
                maxAge: expiresIn / 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: `/owner-panel/${roomId}`,
                sameSite: 'lax',
            });

            return { success: true, roomId };
        } else {
            return { success: false, message: 'كلمة المرور غير صحيحة.' };
        }
    } catch (error: any) {
        console.error('Error verifying owner panel password:', error);
        return { success: false, message: error.message || 'حدث خطأ غير متوقع.' };
    }
}


export async function signOutOwner(roomId: string) {
    cookies().delete(`__session_owner_${roomId}`);
}

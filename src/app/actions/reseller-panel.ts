
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import type { Room, ReservedName, Reseller } from '@/lib/types';
import type { RoomFormValues } from '@/components/admin/room-dialogs';
import type { ColoredNameFormValues } from '@/components/admin/colored-name-dialogs';
import { clearRoomUsers as clearRoomUsersAction } from './clear-room';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';


// --- Verification ---
export async function verifyResellerPassword(resellerName: string, password: string, idToken: string): Promise<{ success: boolean; resellerId?: string; message?: string }> {
    if (!resellerName || !password || !idToken) {
        return { success: false, message: 'معرف الريسلر وكلمة المرور ومصادقة العميل مطلوبة.' };
    }

    try {
        const trimmedResellerName = resellerName.trim();
        const resellersRef = adminDb.collection('resellers');
        const snapshot = await resellersRef.where('name', '==', trimmedResellerName).limit(1).get();

        if (snapshot.empty) {
            return { success: false, message: 'لم يتم العثور على حساب الريسلر.' };
        }

        const resellerDoc = snapshot.docs[0];
        const resellerData = resellerDoc.data() as Reseller;
        const resellerId = resellerDoc.id;

        if (resellerData.password && resellerData.password === password) {
             const expiresIn = 60 * 60 * 24 * 1 * 1000; // 1 day
             const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
 
             cookies().set(`__session_reseller_${resellerId}`, sessionCookie, {
                 maxAge: expiresIn / 1000,
                 httpOnly: true,
                 secure: process.env.NODE_ENV === 'production',
                 path: `/reseller-panel/${resellerId}`,
                 sameSite: 'lax',
             });
            return { success: true, resellerId };
        } else {
            return { success: false, message: 'كلمة المرور غير صحيحة.' };
        }
    } catch (error: any) {
        console.error('Error verifying reseller password:', error);
        return { success: false, message: error.message || 'حدث خطأ غير متوقع.' };
    }
}


// --- Room Management for Reseller ---
export async function addRoomForReseller(resellerId: string, data: RoomFormValues): Promise<void> {
    const roomData: Omit<Room, 'userCount'> = {
        name: data.name,
        description: data.description,
        ownerId: resellerId, // Force ownerId to be the reseller's ID
        isPublic: false, // Rooms created by resellers are always private
        maxUsers: data.maxUsers,
        welcomeMessage: `Welcome to ${data.name}!`,
        renewalDate: data.renewalDate,
        icon: 'MessageSquare',
        isLocked: false,
        showJoinLeaveMessages: true,
        isPrivateChatEnabled: true,
        muteVisitorsVoice: false,
        muteVisitorsText: false,
    };
    await adminDb.collection('chat_rooms').add({
        ...roomData,
        userCount: 0,
        isPublic: false, // Explicitly set to false on creation
    });
    revalidatePath(`/reseller-panel/${resellerId}`);
}

export async function updateRoomForReseller(resellerId: string, roomId: string, data: Partial<Room>): Promise<void> {
    // Ensure the reseller owns this room before updating
    const roomRef = adminDb.collection('chat_rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists || roomDoc.data()?.ownerId !== resellerId) {
        throw new Error("Permission denied. You can only update your own rooms.");
    }
    
    // Ensure isPublic is not changed for reseller rooms
    const updateData = { ...data };
    if (updateData.isPublic) {
        updateData.isPublic = false;
    }

    await roomRef.update(updateData);
    revalidatePath(`/reseller-panel/${resellerId}`);
    revalidatePath(`/owner-panel/${roomId}`);
}

export async function deleteRoomForReseller(resellerId: string, roomId: string): Promise<void> {
    const roomRef = adminDb.collection('chat_rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists || roomDoc.data()?.ownerId !== resellerId) {
        throw new Error("Permission denied. You can only delete your own rooms.");
    }
    await roomRef.delete();
    revalidatePath(`/reseller-panel/${resellerId}`);
}

export async function clearRoomUsersForReseller(resellerId: string, roomId: string): Promise<void> {
    const roomRef = adminDb.collection('chat_rooms').doc(roomId);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists || roomDoc.data()?.ownerId !== resellerId) {
        throw new Error("Permission denied. You can only clear users from your own rooms.");
    }
    await clearRoomUsersAction(roomId);
    revalidatePath(`/reseller-panel/${resellerId}`);
}


// --- Colored Name Management for Reseller ---
export async function addColoredNameForReseller(resellerId: string, data: ColoredNameFormValues): Promise<void> {
    const nameData: ReservedName = {
        name: data.name,
        color: data.color,
        reseller: resellerId, // Force reseller to be the current reseller
        renewalDate: data.renewalDate,
        password: data.password || '',
        cosmeticRank: data.cosmeticRank,
    }
    await adminDb.collection('reserved_names').add(nameData);
    revalidatePath(`/reseller-panel/${resellerId}`);
}

export async function updateColoredNameForReseller(resellerId: string, nameId: string, data: Partial<ReservedName>): Promise<void> {
    const nameRef = adminDb.collection('reserved_names').doc(nameId);
    const nameDoc = await nameRef.get();
    if (!nameDoc.exists || nameDoc.data()?.reseller !== resellerId) {
        throw new Error("Permission denied. You can only update your own colored names.");
    }
    await nameRef.update(data);
    revalidatePath(`/reseller-panel/${resellerId}`);
}

export async function deleteColoredNameForReseller(resellerId: string, nameId: string): Promise<void> {
    const nameRef = adminDb.collection('reserved_names').doc(nameId);
    const nameDoc = await nameRef.get();
    if (!nameDoc.exists || nameDoc.data()?.reseller !== resellerId) {
        throw new Error("Permission denied. You can only delete your own colored names.");
    }
    await nameRef.delete();
    revalidatePath(`/reseller-panel/${resellerId}`);
}

export async function signOutReseller(resellerId: string) {
    cookies().delete(`__session_reseller_${resellerId}`);
    redirect('/reseller-panel/login');
}

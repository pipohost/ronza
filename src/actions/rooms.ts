
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { RoomFormValues } from '@/components/admin/room-dialogs';
import type { Room } from '@/lib/types';

export async function addRoom(data: RoomFormValues): Promise<void> {
    const roomData: Omit<Room, 'userCount'> = {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        isPublic: data.isPublic,
        maxUsers: data.maxUsers,
        ownerPanelPassword: data.ownerPanelPassword || '',
        welcomeMessage: `Welcome to ${data.name}!`,
        renewalDate: data.renewalDate,
        icon: 'MessageSquare',
        isLocked: false,
        showJoinLeaveMessages: true,
        isPrivateChatEnabled: true,
        muteVisitorsVoice: false,
        muteVisitorsText: false,
        categories: data.categories || [],
    };
    await adminDb.collection('chat_rooms').add({
        ...roomData,
        userCount: 0,
    });

    revalidatePath('/admin');
    revalidatePath('/');
}

export async function updateRoom(id: string, data: Partial<Room>): Promise<void> {
    await adminDb.collection('chat_rooms').doc(id).update(data);
    
    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/owner-panel/${id}`);
}

export async function deleteRoom(id: string): Promise<void> {
    await adminDb.collection('chat_rooms').doc(id).delete();
    revalidatePath('/admin');
    revalidatePath('/');
}

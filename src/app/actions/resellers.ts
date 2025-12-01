
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { ResellerFormValues } from '@/components/admin/reseller-dialogs';
import type { Reseller } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';


export async function addReseller(data: ResellerFormValues): Promise<void> {
    const resellerData: Omit<Reseller, 'apiKey' | 'isActive'> = {
        name: data.name,
        userId: data.userId,
        rooms: data.rooms,
        status: data.status,
        renewalDate: data.renewalDate,
        password: data.password || '',
    };
    await adminDb.collection('resellers').add({
        ...resellerData,
        apiKey: uuidv4(),
        isActive: data.status === 'Active',
    });
    revalidatePath('/admin');
}

export async function updateReseller(id: string, data: Partial<Reseller>): Promise<void> {
    const updateData = { ...data };
    if (data.status) {
        updateData.isActive = data.status === 'Active';
    }
    await adminDb.collection('resellers').doc(id).update(updateData);
    revalidatePath('/admin');
}

export async function deleteReseller(id: string): Promise<void> {
    await adminDb.collection('resellers').doc(id).delete();
    revalidatePath('/admin');
}

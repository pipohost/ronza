
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { ColoredNameFormValues } from '@/components/admin/colored-name-dialogs';
import type { ReservedName } from '@/lib/types';

export async function addColoredName(data: ColoredNameFormValues): Promise<void> {
    const nameData: ReservedName = {
        name: data.name,
        color: data.color,
        reseller: data.reseller,
        renewalDate: data.renewalDate,
        password: data.password || '',
        cosmeticRank: data.cosmeticRank || 'registered_member',
    }
    await adminDb.collection('reserved_names').add(nameData);
    revalidatePath('/admin');
}

export async function updateColoredName(id: string, data: Partial<ReservedName>): Promise<void> {
    await adminDb.collection('reserved_names').doc(id).update(data);
    revalidatePath('/admin');
}

export async function deleteColoredName(id: string): Promise<void> {
    await adminDb.collection('reserved_names').doc(id).delete();
    revalidatePath('/admin');
}

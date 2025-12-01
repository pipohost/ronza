
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Post } from '@/lib/types';

export async function addLike(postId: string, deviceId: string) {
    if (!postId || !deviceId) {
        throw new Error('Post ID and Device ID are required.');
    }

    const postRef = adminDb.collection('posts').doc(postId);

    try {
        let slug: string | undefined;
        await adminDb.runTransaction(async (transaction) => {
            const postDoc = await transaction.get(postRef);
            if (!postDoc.exists) {
                throw new Error("Post not found.");
            }

            const postData = postDoc.data() as Post;
            slug = postData.slug;
            const likedBy: string[] = postData?.likedBy || [];
            
            if (likedBy.includes(deviceId)) {
                // User is unliking
                transaction.update(postRef, {
                    likesCount: FieldValue.increment(-1),
                    likedBy: FieldValue.arrayRemove(deviceId)
                });
            } else {
                // User is liking
                transaction.update(postRef, {
                    likesCount: FieldValue.increment(1),
                    likedBy: FieldValue.arrayUnion(deviceId)
                });
            }
        });

        // Revalidate the path to update the UI for all users
        revalidatePath('/journal');
        if (slug) {
            revalidatePath(`/journal/${slug}`);
        }

    } catch (error: any) {
        console.error(`Failed to update like for post ${postId}:`, error);
        throw new Error(`Could not update like. Please try again. Error: ${error.message}`);
    }
}

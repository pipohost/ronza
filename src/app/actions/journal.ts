'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { Post, Comment } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-ءا-ي]+/g, ''); // Keep alphanumeric, hyphens, and Arabic characters
};


// Schema for adding/editing a post
const postSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  imageUrl: z.string().url('Must be a valid image URL.').optional().or(z.literal('')),
  title_en: z.string().optional(),
  content_en: z.string().optional(),
});

export async function addPost(data: z.infer<typeof postSchema>) {
    try {
        const validatedData = postSchema.parse(data);
        const slug = generateSlug(validatedData.title);
        const newPost: Omit<Post, 'comments'> = {
            ...validatedData,
            slug,
            authorName: 'Ronza Team',
            authorAvatarUrl: 'https://picsum.photos/seed/ronza_team/100/100', // Generic team avatar
            timestamp: FieldValue.serverTimestamp(),
            likesCount: 0,
            likedBy: [],
        };
        await adminDb.collection('posts').add(newPost);
        revalidatePath('/journal');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { error: error.errors.map(e => e.message).join(', ') };
        }
        return { error: error.message || 'Failed to add post.' };
    }
}

export async function updatePost(postId: string, data: z.infer<typeof postSchema>) {
    try {
        const validatedData = postSchema.parse(data);
        const slug = generateSlug(validatedData.title);
        const updateData = {
            ...validatedData,
            slug,
        };
        await adminDb.collection('posts').doc(postId).update(updateData);
        revalidatePath('/journal');
        revalidatePath(`/journal/${postId}`);
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { error: error.errors.map(e => e.message).join(', ') };
        }
        return { error: error.message || 'Failed to update post.' };
    }
}

export async function deletePost(postId: string) {
    try {
        // You might want to delete subcollections like comments here as well in a real app
        const postDoc = await adminDb.collection('posts').doc(postId).get();
        await adminDb.collection('posts').doc(postId).delete();
        
        revalidatePath('/journal');
        revalidatePath(`/journal/${postId}`);
        revalidatePath('/admin');

        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to delete post.' };
    }
}


// Schema for adding a comment
const commentSchema = z.object({
    postId: z.string().min(1),
    authorName: z.string().min(2, "Name is required."),
    text: z.string().min(1, "Comment cannot be empty.").max(200, "Comment is too long.").refine(value => !/https?:\/\/|www\./.test(value), {
        message: "Links are not allowed in comments.",
    }),
});


export async function addComment(data: z.infer<typeof commentSchema>) {
    try {
        const validatedData = commentSchema.parse(data);
        const newComment: Comment = {
            ...validatedData,
            timestamp: FieldValue.serverTimestamp(),
        }
        const postRef = adminDb.collection('posts').doc(validatedData.postId);
        await postRef.collection('comments').add(newComment);
        
        revalidatePath('/journal');
        revalidatePath(`/journal/${validatedData.postId}`);

        return { success: true };

    } catch (error: any) {
         if (error instanceof z.ZodError) {
            return { error: error.errors.map(e => e.message).join(', ') };
        }
        return { error: error.message || 'Failed to add comment.' };
    }
}

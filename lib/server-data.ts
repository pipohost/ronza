'use server';

import { adminDb, adminAuth } from './firebase-admin';
import admin from 'firebase-admin';
import type { Room, Reseller, ReservedName, User, WithId, RegisteredMember, BannedUser, Post, Comment, VisitorLog, GlobalBan } from './types';
import fs from 'fs';
import path from 'path';
import { serializeTimestamps } from './utils';

export async function getFirebaseConfig() {
    // This configuration is now valid and contains the correct API key.
    return {
        projectId: "studio-7146503853-7b89c",
        appId: "1:949418216545:web:d8d0ee8fcae5899caeae20",
        apiKey: "AIzaSyBo2vjKwWJMUvUYBo9tVL7BNW2ic0RUt6U",
        authDomain: "studio-7146503853-7b89c.firebaseapp.com",
    };
}

async function getCollection<T>(collectionName: string, queryConstraints: [string, admin.firestore.WhereFilterOp, any][] = [], limit?: number, orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc'): Promise<WithId<T>[]> {
  try {
    let query: admin.firestore.Query = adminDb.collection(collectionName);
    
    queryConstraints.forEach(([field, op, value]) => {
        query = query.where(field, op, value);
    })

    if (orderByField) {
        query = query.orderBy(orderByField, orderDirection);
    }
    if (limit) {
        query = query.limit(limit);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<T>));
    return serializeTimestamps(data) || [];
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    // In case of error (e.g., permissions), return an empty array to avoid crashing the app
    return [];
  }
}


async function getSubCollection<T>(collectionPath: string): Promise<WithId<T>[]> {
    try {
        const snapshot = await adminDb.collection(collectionPath).get();
        if (snapshot.empty) {
            return [];
        }
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<T>));
        return serializeTimestamps(data);
    } catch (error) {
        console.error(`Error fetching subcollection ${collectionPath}:`, error);
        return [];
    }
}


// --- Visitor Logs ---
export async function getVisitorLogs(ownerId?: string): Promise<WithId<VisitorLog>[]> {
    const constraints: [string, admin.firestore.WhereFilterOp, any][] = [];
    if (ownerId) {
        constraints.push(['ownerId', '==', ownerId]);
    }
    return getCollection<VisitorLog>('visitor_logs', constraints, 100, 'timestamp', 'desc');
}


// --- Journal (Posts & Comments) ---
export async function getPosts(): Promise<WithId<Post>[]> {
    const postsCollection = await adminDb.collection('posts').orderBy('timestamp', 'desc').get();
    const posts = await Promise.all(postsCollection.docs.map(async (postDoc) => {
        const postData = postDoc.data() as Post;
        const commentsSnapshot = await postDoc.ref.collection('comments').orderBy('timestamp', 'asc').get();
        
        return {
            id: postDoc.id,
            ...postData,
            comments: commentsSnapshot.docs.map(d => ({id: d.id, ...d.data()})),
        };
    }));

    return serializeTimestamps(posts);
}

export async function getPostById(postId: string): Promise<WithId<Post> | null> {
    try {
        const postDoc = await adminDb.collection('posts').doc(postId).get();
        if (!postDoc.exists) {
            return null;
        }

        const postData = postDoc.data() as Post;
        
        const commentsSnapshot = await postDoc.ref.collection('comments').orderBy('timestamp', 'asc').get();
        const comments = commentsSnapshot.docs.map(doc => serializeTimestamps({ id: doc.id, ...doc.data() } as WithId<Comment>));
        
        const result: WithId<Post> = {
            id: postDoc.id,
            ...postData,
            comments: comments,
        };

        return serializeTimestamps(result);

    } catch (error) {
        console.error(`Error fetching post by ID ${postId}:`, error);
        return null;
    }
}


export async function getRoomsByOwner(ownerId: string): Promise<WithId<Room>[]> {
    return getCollection<Room>('chat_rooms', [['ownerId', '==', ownerId]]);
}

export async function getColoredNamesByOwner(ownerId: string): Promise<WithId<ReservedName>[]> {
    return getCollection<ReservedName>('reserved_names', [['reseller', '==', ownerId]]);
}

export async function getBannedUsersByOwner(ownerId: string): Promise<WithId<BannedUser>[]> {
    const snapshot = await adminDb.collection('resellers').doc(ownerId).collection('bannedUsers').get();
    if (snapshot.empty) {
        return [];
    }
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<BannedUser>));
    return serializeTimestamps(data);
}

export async function getRooms({ publicOnly = false }: { publicOnly?: boolean } = {}): Promise<WithId<Room>[]> {
  const constraints: [string, admin.firestore.WhereFilterOp, any][] = [];
  if (publicOnly) {
    constraints.push(['isPublic', '==', true]);
    constraints.push(['ownerId', '==', 'root']); // Only get public rooms from root
  }
  const rooms = await getCollection<Room>('chat_rooms', constraints);
  
  // Ensure userCount is accurate
  for (const room of rooms) {
      const usersSnapshot = await adminDb.collection('chat_rooms').doc(room.id).collection('users').get();
      const cameraOnCount = usersSnapshot.docs.filter(doc => doc.data().isCameraOn).length;
      
      if (room.userCount !== usersSnapshot.size || room.cameraOnCount !== cameraOnCount) {
          await adminDb.collection('chat_rooms').doc(room.id).update({ 
            userCount: usersSnapshot.size,
            cameraOnCount: cameraOnCount,
          });
          room.userCount = usersSnapshot.size;
          room.cameraOnCount = cameraOnCount;
      }
  }

  return rooms;
}

export async function getPublicRooms(): Promise<WithId<Room>[]> {
    const publicRooms = await getRooms({ publicOnly: true });
    return publicRooms || [];
}


export async function getRoomById(roomId: string): Promise<WithId<Room> | null> {
    try {
        const doc = await adminDb.collection('chat_rooms').doc(roomId).get();
        if (!doc.exists) {
            return null;
        }
        const roomData = doc.data() as Room;

        const bannedUsers = await getSubCollection<BannedUser>(`chat_rooms/${roomId}/bannedUsers`);
        const registeredMembers = await getSubCollection<RegisteredMember>(`chat_rooms/${roomId}/registeredMembers`);

        const result = { 
            id: doc.id,
            ...roomData,
            activityLog: roomData.activityLog || [],
            wordFilter: roomData.wordFilter || [],
            reservedNames: roomData.reservedNames || [],
            bannedUsers: bannedUsers,
            registeredMembers: registeredMembers,
        };
        return serializeTimestamps(result);
    } catch (error) {
        console.error(`Error fetching room ${roomId}:`, error);
        return null;
    }
}

export async function getRoomMembers(roomId: string): Promise<WithId<RegisteredMember>[]> {
    return getSubCollection<RegisteredMember>(`chat_rooms/${roomId}/registeredMembers`);
}

export async function getBannedUsers(roomId: string): Promise<WithId<BannedUser>[]> {
    return getSubCollection<BannedUser>(`chat_rooms/${roomId}/bannedUsers`);
}

export async function getGlobalBans(): Promise<WithId<GlobalBan>[]> {
    return getCollection<GlobalBan>('global_bans');
}

export async function getActivityLog(roomId: string): Promise<string[]> {
    try {
        const roomDoc = await getRoomById(roomId);
        return roomDoc?.activityLog || [];
    } catch (error) {
        console.error(`Error fetching activity log for room ${roomId}:`, error);
        return [];
    }
}


export async function getResellers(): Promise<WithId<Reseller>[]> {
  return getCollection<Reseller>('resellers');
}

export async function getResellerById(resellerId: string): Promise<WithId<Reseller> | null> {
    try {
        const doc = await adminDb.collection('resellers').doc(resellerId).get();
        if (!doc.exists) {
            return null;
        }
        const data = { id: doc.id, ...doc.data() } as WithId<Reseller>;
        return serializeTimestamps(data);
    } catch (error) {
        console.error(`Error fetching reseller ${resellerId}:`, error);
        return null;
    }
}

export async function getColoredNames(): Promise<WithId<ReservedName>[]> {
  return getCollection<ReservedName>('reserved_names');
}

export async function getUsers(roomId?: string): Promise<WithId<User>[]> {
    if (roomId) {
        return getSubCollection<User>(`chat_rooms/${roomId}/users`);
    }
    
    // This is a simplified version. In a real app, you wouldn't fetch all users from all rooms.
    const allUsers: WithId<User>[] = [];
    const roomsSnapshot = await adminDb.collection('chat_rooms').get();
    for (const roomDoc of roomsSnapshot.docs) {
        const users = await getSubCollection<User>(`chat_rooms/${roomDoc.id}/users`);
        allUsers.push(...users);
    }
    return allUsers;
}

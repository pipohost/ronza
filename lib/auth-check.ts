
'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { User, UserRole, WithId } from './types';

interface AuthResult {
  moderator: WithId<User>;
  moderatorId: string;
}

/**
 * Checks if a user has the required moderator privileges.
 * A user is considered a moderator if they have one of the required roles
 * OR if they have the 'mythical_admin' cosmetic rank.
 * @param user The user object to check.
 * @param requiredRoles An array of roles that are allowed.
 * @returns True if the user is a moderator, false otherwise.
 */
function isModerator(user: User, requiredRoles: UserRole[]): boolean {
    if (requiredRoles.length === 0 && user.cosmeticRole === 'mythical_admin') {
        return true;
    }
    if (user.cosmeticRole === 'mythical_admin') {
        return true;
    }
    if (requiredRoles.length > 0 && requiredRoles.includes(user.role)) {
        return true;
    }
    return false;
}

/**
 * Delays execution for a specified amount of time.
 * @param ms The number of milliseconds to wait.
 */
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifies the user's session cookie and checks if they have the required role in a specific room.
 * This is a secure, server-side-only function.
 * @param roomId The ID of the room to check permissions against.
 * @param requiredRoles An array of roles that are allowed to perform the action. If empty, only checks for authentication.
 * @returns The moderator's user data and their ID.
 * @throws An error if the user is not authenticated or does not have the required role.
 */
export async function checkAuth(roomId: string, requiredRoles: UserRole[]): Promise<AuthResult> {
  // 1. Verify Session Cookie
  const sessionCookie = cookies().get('__session')?.value || '';
  if (!sessionCookie) {
    throw new Error("Authentication error: No session cookie provided. Please sign in.");
  }

  let decodedIdToken;
  try {
    decodedIdToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    throw new Error("Authentication error: Invalid or expired session. Please sign in again.");
  }

  const moderatorId = decodedIdToken.uid;

  // 2. Get Moderator's User Document from the Room
  const moderatorDocRef = adminDb.collection('chat_rooms').doc(roomId).collection('users').doc(moderatorId);
  
  let moderatorDoc = await moderatorDocRef.get();
  
  // 2.5 Smart Retry for eventual consistency
  if (!moderatorDoc.exists) {
      await sleep(300); // Wait for potential replication delay
      moderatorDoc = await moderatorDocRef.get();
      if (!moderatorDoc.exists) {
        throw new Error("Permission error: You are not a member of this room.");
      }
  }


  let moderator = { id: moderatorDoc.id, ...moderatorDoc.data() } as WithId<User>;

  // 3. Check Role (including cosmetic override)
  if (!isModerator(moderator, requiredRoles)) {
     // SMART RETRY MECHANISM:
     // Sometimes, an action is triggered immediately upon a user joining/role-change.
     // Firestore's eventual consistency might mean the server reads the *old* role.
     // We'll wait a fraction of a second and retry the check once.
     await sleep(400);
     moderatorDoc = await moderatorDocRef.get(); // Re-fetch the document
     if (moderatorDoc.exists) {
         moderator = { id: moderatorDoc.id, ...moderatorDoc.data() } as WithId<User>;
         // If it still fails, now we can throw the error.
         if (!isModerator(moderator, requiredRoles)) {
             throw new Error(`Permission error: You must have one of the following roles: ${requiredRoles.join(', ')}.`);
         }
     } else {
        // If the doc disappeared, they are no longer in the room.
         throw new Error("Permission error: You are not a member of this room.");
     }
  }


  return { moderator, moderatorId };
}

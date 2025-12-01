
'use client';

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import { getFirebaseConfig } from '@/lib/server-data';
import { getFirebase, FirebaseServices } from '@/app/chat-room/[roomId]/firebase-client';

export function useAdminCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
        try {
            const firebaseConfig = await getFirebaseConfig();
            const { auth: authInstance } = await getFirebase(firebaseConfig);
            setAuth(authInstance);
        } catch (error) {
            console.error("Firebase initialization error in useAdminCheck:", error);
        } finally {
            setIsLoading(false); // Used to be isAuthLoading
        }
    };
    initializeFirebase();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // In a real app, you'd verify the user's custom claims here to check for admin role.
        // For this simplified example, we'll assume any logged-in user on this path is an admin.
        setIsAdmin(true); 
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return { isAdmin, isLoading, auth };
}

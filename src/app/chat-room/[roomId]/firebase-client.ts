
import { initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, Auth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: any; // Firestore instance
}

let firebaseServices: FirebaseServices | null = null;
let initializationPromise: Promise<FirebaseServices> | null = null;

async function _initializeFirebase(firebaseConfig: any): Promise<FirebaseServices> {
  let app: FirebaseApp;
  try {
    app = getApp(firebaseConfig.projectId);
  } catch {
    app = initializeApp(firebaseConfig, firebaseConfig.projectId);
  }

  const auth = getAuth(app);
  const db = getFirestore(app);

  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Anonymous sign-in failed during initialization:", error);
      // We still return the services, but auth state will be unauthenticated.
      // The calling component should handle this.
    }
  }

  return { app, auth, db };
}

/**
 * Initializes Firebase services (App, Auth, Firestore) and ensures
 * it only happens once. Also ensures anonymous user is signed in.
 * @param firebaseConfig The Firebase config object.
 * @returns A promise that resolves with the Firebase services.
 */
export function getFirebase(firebaseConfig: any): Promise<FirebaseServices> {
  if (firebaseServices) {
    return Promise.resolve(firebaseServices);
  }

  if (!initializationPromise) {
    initializationPromise = _initializeFirebase(firebaseConfig)
      .then(services => {
        firebaseServices = services;
        return services;
      })
      .catch(error => {
        initializationPromise = null; // Reset promise on failure
        throw error;
      });
  }

  return initializationPromise;
}

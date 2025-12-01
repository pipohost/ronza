// @ts-nocheck
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Check if the app is already initialized to prevent errors.
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'docs', 'google-credentials.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account key not found at path: ${serviceAccountPath}. Make sure the file exists.`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
  } catch (error) {
    console.error("CRITICAL: Firebase Admin SDK initialization failed.", error);
    // In a production environment, you might want to handle this more gracefully.
    // For now, we'll throw to make it clear that the server can't start without this.
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

// Export the initialized services for use in other server-side modules.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();


const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// This is the correct way for a Cloud Functions environment
try {
    admin.initializeApp();
} catch (e) {
    console.log("Re-initializing admin");
}

const db = admin.firestore();


// --- User Cleanup ---
exports.userCleanup = functions.pubsub.schedule("every 1 minutes").onRun(async (context) => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    const roomsSnapshot = await db.collection("chat_rooms").get();
    if (roomsSnapshot.empty) {
        return null;
    }

    const cleanupPromises = roomsSnapshot.docs.map(async (roomDoc) => {
        const roomId = roomDoc.id;
        const roomRef = roomDoc.ref;
        
        const usersRef = roomRef.collection("users");
        const inactiveUsersQuery = usersRef.where("lastSeen", "<", oneMinuteAgo);
        
        const snapshot = await inactiveUsersQuery.get();
        if (snapshot.empty) return;

        const batch = db.batch();
        let deletedCount = 0;
        
        snapshot.forEach(doc => {
            const userData = doc.data();
            const userName = userData.name || 'A user';
            console.log(`Marking user ${doc.id} (${userName}) in room ${roomId} for deletion due to inactivity.`);
            batch.delete(doc.ref);
            deletedCount++;
            
            // Add a leave message if the room settings allow it
            if (roomDoc.data().showJoinLeaveMessages) {
                const messageRef = roomRef.collection('messages').doc();
                batch.set(messageRef, {
                    userId: 'system',
                    userName: 'System',
                    userRole: 'visitor',
                    text: `User ${userName} has left (timeout).`,
                    color: '#888888',
                    type: 'status',
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
        });

        if (deletedCount > 0) {
             batch.update(roomRef, { userCount: admin.firestore.FieldValue.increment(-deletedCount) });
        }
        
        if (batch._writes.length > 0) {
            await batch.commit();
            console.log(`Cleaned up ${deletedCount} inactive users from room ${roomId}.`);
        }
    });
    
    await Promise.all(cleanupPromises);
    return null;
});


// --- Mic Queue Management ---
exports.manageMicQueue = functions.firestore.document('chat_rooms/{roomId}')
    .onUpdate(async (change, context) => {
        const { roomId } = context.params;
        const roomRef = db.collection('chat_rooms').doc(roomId);

        try {
            await db.runTransaction(async (transaction) => {
                const roomDoc = await transaction.get(roomRef);
                if (!roomDoc.exists) return;

                let roomData = roomDoc.data();
                let queue = roomData.mic_queue || [];
                const usersRef = roomRef.collection('users');

                // Get all users who have their hands raised but are not muted
                const handRaisedSnapshot = await transaction.get(usersRef.where('handRaised', '==', true).where('isMuted', '==', false));
                const potentialSpeakers = new Map(handRaisedSnapshot.docs.map(doc => [doc.id, doc.data()]));

                // Filter queue: remove users who are no longer potential speakers
                queue = queue.filter(entry => potentialSpeakers.has(entry.userId));

                // Add new potential speakers to the queue if they aren't already in it
                potentialSpeakers.forEach((userData, userId) => {
                    if (!queue.some(entry => entry.userId === userId)) {
                        queue.push({
                            userId: userId,
                            userName: userData.name,
                            role: userData.role,
                            handRaisedAt: userData.handRaisedAt
                        });
                    }
                });

                // Sort the queue by role and then by timestamp
                const roleOrder = { 'superadmin': 0, 'admin': 1, 'special': 2, 'visitor': 3 };
                queue.sort((a, b) => {
                    const roleComparison = roleOrder[a.role] - roleOrder[b.role];
                    if (roleComparison !== 0) return roleComparison;
                    return a.handRaisedAt - b.handRaisedAt;
                });
                
                // Get all users currently marked as speaking
                const speakingUsersSnapshot = await transaction.get(usersRef.where('isSpeaking', '==', true));
                const currentSpeakers = speakingUsersSnapshot.docs;
                let isMicFree = currentSpeakers.length === 0;

                // If there are any speakers, check if they are still valid
                if (currentSpeakers.length > 0) {
                    let activeSpeakerFound = false;
                    for (const speakerDoc of currentSpeakers) {
                        const speakerId = speakerDoc.id;
                        // Is this speaker still a potential speaker (hand raised, not muted)?
                        if (potentialSpeakers.has(speakerId)) {
                             // If we already found an active speaker, this one is extra, demote it.
                             if (activeSpeakerFound) {
                                transaction.update(speakerDoc.ref, { isSpeaking: false });
                             } else {
                                activeSpeakerFound = true;
                             }
                        } else {
                            // This speaker is no longer valid (lowered hand, was muted, etc.), demote them.
                            transaction.update(speakerDoc.ref, { isSpeaking: false });
                        }
                    }
                     // If after checking all speakers, none were valid, the mic is now free.
                    if (!activeSpeakerFound) {
                        isMicFree = true;
                    } else {
                        isMicFree = false;
                    }
                }
                
                // If the mic is free and there's a queue, promote the next user
                if (isMicFree && queue.length > 0) {
                    const nextSpeakerEntry = queue.shift(); // Remove from front of queue
                    if (nextSpeakerEntry) {
                        const nextSpeakerUserRef = usersRef.doc(nextSpeakerEntry.userId);
                         // Check if user document still exists before updating
                        const nextSpeakerDoc = await transaction.get(nextSpeakerUserRef);
                        if (nextSpeakerDoc.exists) {
                            transaction.update(nextSpeakerUserRef, { isSpeaking: true, handRaised: false, handRaisedAt: null, micTimeStarted: Date.now() });
                        }
                    }
                }
                
                // Update the room's mic_queue in Firestore
                transaction.update(roomRef, { mic_queue: queue });
            });

            console.log(`Successfully managed mic queue for room ${roomId}`);
        } catch (error) {
            console.error(`Error managing mic queue for room ${roomId}:`, error);
        }
    });

    

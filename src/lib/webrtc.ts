
'use client';

import { doc, onSnapshot, updateDoc, arrayUnion, FieldValue, deleteField } from 'firebase/firestore';
import { RTC_CONFIG } from './rtc-config';

// A simple in-memory registry to manage listeners and prevent memory leaks.
const peerConnectionsRegistry: {
  [key: string]: {
    pc: RTCPeerConnection;
    listeners: Array<() => void>;
  }
} = {};


export function createPeerConnection(
  myId: string,
  peerId: string,
  db: any,
  roomId: string,
  localStream: MediaStream | null,
  onTrack: (stream: MediaStream) => void
): RTCPeerConnection {
  
  if (peerConnectionsRegistry[peerId]) {
    console.warn(`Connection to ${peerId} already exists. Re-using existing connection.`);
    return peerConnectionsRegistry[peerId].pc;
  }

  const pc = new RTCPeerConnection(RTC_CONFIG);

  peerConnectionsRegistry[peerId] = {
    pc,
    listeners: [],
  };

  pc.onicecandidate = async (event) => {
    if (event.candidate) {
        const candidateData = event.candidate.toJSON();
        const peerDocRef = doc(db, `chat_rooms/${roomId}/users/${peerId}`);
        // Use a try-catch as this can fail if the peer disconnects abruptly.
        try {
            await updateDoc(peerDocRef, {
                [`iceCandidates.${myId}`]: arrayUnion(candidateData)
            });
        } catch (e) {
            console.warn(`Failed to send ICE candidate to ${peerId}:`, e);
        }
    }
  };
  
  pc.ontrack = (event) => {
    onTrack(event.streams[0]);
  };

  localStream?.getTracks().forEach(track => {
    try {
        pc.addTrack(track, localStream);
    } catch (e) {
        console.warn("Could not add track to peer connection:", e);
    }
  });

  // Listen for ICE candidates from the peer
  const selfDocRef = doc(db, `chat_rooms/${roomId}/users/${myId}`);
  const unsubscribeIce = onSnapshot(selfDocRef, async (snapshot) => {
    const data = snapshot.data();
    if (data?.iceCandidates?.[peerId]) {
      const candidates = data.iceCandidates[peerId];
      for (const candidate of candidates) {
        try {
            // Check pc state before adding candidate
            if (pc.signalingState !== 'closed' && candidate) {
                 await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (e) {
            console.error("Error adding received ICE candidate", e);
        }
      }
      // CRITICAL FIX: Clear the candidates field after processing them.
      // This prevents re-adding old candidates on subsequent snapshots.
      try {
          await updateDoc(selfDocRef, {
              [`iceCandidates.${peerId}`]: deleteField()
          });
      } catch (e) {
        console.warn("Failed to clear ICE candidates:", e);
      }
    }
  });

  peerConnectionsRegistry[peerId].listeners.push(unsubscribeIce);

  const originalClose = pc.close.bind(pc);
  pc.close = () => {
    if (peerConnectionsRegistry[peerId]) {
        peerConnectionsRegistry[peerId].listeners.forEach(unsub => unsub());
        delete peerConnectionsRegistry[peerId];
    }
    if (pc.signalingState !== 'closed') {
        originalClose();
    }
  }

  return pc;
}

export function closePeerConnection(peerId: string, peerConnectionsRef?: React.MutableRefObject<{ [key: string]: RTCPeerConnection | null }>) {
  // New logic using the registry
  if (peerConnectionsRegistry[peerId]) {
    peerConnectionsRegistry[peerId].pc.close(); // This will trigger the cleanup logic in the overridden close method.
  }
  
  // Keep the old ref updated for compatibility if it's passed
  if (peerConnectionsRef && peerConnectionsRef.current[peerId]) {
      peerConnectionsRef.current[peerId] = null;
  }
}

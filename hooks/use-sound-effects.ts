'use client';

import { useCallback, useMemo } from 'react';

// Use a simple in-memory cache for the audio objects
const audioCache = new Map<string, HTMLAudioElement>();

const sounds = {
  messageSent: '/sounds/message-sent.mp3',
  messageReceived: '/sounds/message-received.mp3',
  userJoined: '/sounds/user-join.mp3',
  userLeft: '/sounds/user-leave.mp3',
  mention: '/sounds/mention.mp3',
};

type SoundType = keyof typeof sounds;

const useSoundEffects = () => {
  const preloadSound = useCallback((type: SoundType) => {
    if (typeof window === 'undefined') return;
    
    const src = sounds[type];
    if (!audioCache.has(src)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioCache.set(src, audio);
    }
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (typeof window === 'undefined') return;

    const src = sounds[type];
    let audio = audioCache.get(src);

    if (!audio) {
      preloadSound(type);
      audio = audioCache.get(src);
    }

    if (audio) {
      // Ensure we're not interrupting an already playing sound if not desired
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.play().catch(error => {
        // Autoplay restrictions might prevent the sound from playing
        // without a direct user interaction.
        console.warn(`Could not play sound: ${type}`, error);
      });
    }
  }, [preloadSound]);

  return useMemo(() => ({
    playMessageSent: () => playSound('messageSent'),
    playMessageReceived: () => playSound('messageReceived'),
    playUserJoined: () => playSound('userJoined'),
    playUserLeft: () => playSound('userLeft'),
    playMention: () => playSound('mention'),
    preload: (type: SoundType) => preloadSound(type),
  }), [playSound, preloadSound]);
};

export { useSoundEffects };

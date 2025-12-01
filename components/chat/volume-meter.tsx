
'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';

interface VolumeMeterProps {
  stream: MediaStream | null;
  isMicEnabled: boolean;
}

export default function VolumeMeter({ stream, isMicEnabled }: VolumeMeterProps) {
  const [volume, setVolume] = React.useState(0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const dataArrayRef = React.useRef<Uint8Array | null>(null);
  const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Centralized cleanup function
    const cleanup = () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          // Can happen if context is already closed, which is fine
        }
        sourceRef.current = null;
      }
       if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch(e) {
          // Can happen if context is already closed, which is fine
        }
        analyserRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      setVolume(0);
    };

    // If there is a valid, enabled audio stream
    if (stream && stream.getAudioTracks().length > 0 && isMicEnabled) {
      // Ensure we have a single, active AudioContext
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioContext = audioContextRef.current;
      
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      const draw = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        animationFrameRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        for(let i = 0; i < dataArrayRef.current.length; i++) {
          sum += dataArrayRef.current[i];
        }
        const avg = sum / dataArrayRef.current.length;
        // Apply some scaling to make the meter more responsive
        const newVolume = Math.min(100, Math.max(0, avg * 1.5 - 20));
        setVolume(newVolume);
      };

      draw();

    } else {
      // If stream is null or audio is disabled, ensure everything is cleaned up
      cleanup();
    }

    // Return the cleanup function to be called when the stream changes or component unmounts
    return cleanup;
  }, [stream, isMicEnabled]);

  return (
    <div className="p-2 bg-background/50 rounded-lg">
      <Progress value={volume} className="h-4 border border-black/10 shadow-inner bg-gray-300 dark:bg-gray-700" />
    </div>
  );
}

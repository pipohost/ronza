'use client';
import { MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface VideoDisplayProps {
    stream: MediaStream;
    isLocal?: boolean;
}

export default function VideoDisplay({ stream, isLocal = false }: VideoDisplayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const isAudioMuted = stream.getAudioTracks().length > 0 && !stream.getAudioTracks()[0].enabled;

    return (
      <div className={cn(
          "relative w-full h-full bg-black flex items-center justify-center",
          isLocal && "transform-gpu scale-x-[-1]" // Mirror local video
        )}>
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="w-full h-full object-cover" />
        {isAudioMuted && (
            <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full">
                <MicOff className="h-4 w-4 text-white" />
            </div>
        )}
      </div>
    );
  }

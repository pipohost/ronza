
'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function ReconnectingModal() {
    const { t } = useTranslation();
    const [countdown, setCountdown] = React.useState(10);

    React.useEffect(() => {
        setCountdown(10); // Reset countdown when modal appears
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    return 10; // Restart countdown
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const countdownText = t.room.reconnecting_countdown.replace('{countdown}', countdown.toString());

    return (
        <div className="absolute inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white pointer-events-auto">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-3xl font-bold mb-2">{t.room.reconnecting}</h2>
            <p className="text-lg text-muted-foreground mb-4">{t.room.reconnecting_subtitle}</p>
            <div className="text-sm text-muted-foreground bg-white/10 px-4 py-2 rounded-full">
                {countdownText}
            </div>
        </div>
    );
}

    
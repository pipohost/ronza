
'use client';

import { usePathname } from 'next/navigation';
import { TranslationProvider } from '@/hooks/use-translation';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from './main-layout';
import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

function LoadingScreen() {
    // Return a simple, non-interactive loading screen that is identical on server and client.
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 p-4">
                <div className="container flex items-center justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </header>
            <main className="flex-1 container mx-auto py-8">
                 <Skeleton className="h-48 w-full" />
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                 </div>
            </main>
        </div>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // This effect runs only on the client, after the initial render.
        setIsClient(true);
    }, []);

    // On the server and during initial client render, show a placeholder.
    if (!isClient) {
        // You can return a generic loader here if you want to avoid layout shifts.
        // For now, returning null is the simplest way to ensure server and client match.
        // Let's return a basic skeleton to avoid a blank screen
        return (
            <TranslationProvider>
                <LoadingScreen />
                <Toaster />
            </TranslationProvider>
        );
    }
    
    // Once on the client, we can safely check the pathname.
    const isPanelPage = pathname.startsWith('/admin') || pathname.startsWith('/owner-panel') || pathname.startsWith('/reseller-panel');
    const isChatRoom = pathname.startsWith('/chat-room');
    const isChatTemplate = pathname.startsWith('/chat-template-preview-internal');
    
    const useMinimalLayout = isPanelPage || isChatRoom || isChatTemplate;

    return (
        <TranslationProvider>
            {useMinimalLayout ? (
                <>
                    {children}
                </>
            ) : (
                <MainLayout>
                    {children}
                </MainLayout>
            )}
            <Toaster />
        </TranslationProvider>
    );
}

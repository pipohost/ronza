
import type { Metadata } from 'next';
import '../../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { TranslationProvider } from '@/hooks/use-translation';

// This layout is for the popped-out chat room window.
// It should be minimal and not include the main site's header or footer.
// The dynamic metadata is now handled in the page.tsx file.
export const metadata: Metadata = {
  robots: {
    index: true, // Allow indexing
    follow: true,
  }
};

export default function ChatRoomLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TranslationProvider>
            {children}
            <Toaster />
        </TranslationProvider>
      </body>
    </html>
  );
}

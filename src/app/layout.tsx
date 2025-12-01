
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Cairo } from 'next/font/google';
import { Providers } from '@/components/layout/providers';
import translations from '@/lib/translations.json';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ronza-chat.com'),
  title: {
    template: '%s | Ronza Chat',
    default: 'Ronza Chat Rooms | غرف دردشة رونزا',
  },
  description: 'Join Ronza chat rooms for a unique communication experience. High-quality voice, text, and video chat. انضم إلى غرف دردشة رونزا واستمتع بتجربة تواصل فريدة. دردشة صوتية، نصية، ومرئية عالية الجودة.',
  keywords: 'شات رونزا, غرف دردشة, دردشة صوتية, شات كتابي, شات فيديو, Ronza chat, chat rooms, voice chat, text chat, video chat, chat, ronza, ronza4chat',
  manifest: '/manifest.json',
   alternates: {
    canonical: '/',
    languages: {
      'ar': '/',
      'en': '/en',
    },
  },
  openGraph: {
      title: 'Ronza Chat | غرف دردشة رونزا',
      description: 'The next generation of voice, text, and video chat rooms. الجيل الجديد من غرف الدردشة الصوتية، النصية، والمرئية.',
      images: ['/og-image.png'],
  },
  twitter: {
      card: 'summary_large_image',
      title: 'Ronza Chat | غرف دردشة رونزا',
      description: 'The next generation of voice, text, and video chat rooms. الجيل الجديد من غرف الدردشة الصوتية، النصية، والمرئية.',
      images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
        <head>
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9308748043145185" crossOrigin="anonymous"></script>
        </head>
        <body
            className={cn(
            'min-h-screen bg-background font-body antialiased',
            cairo.variable
            )}
        >
            <Providers>
              {children}
            </Providers>
        </body>
    </html>
  );
}

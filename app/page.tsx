
'use server';

import Hero from '@/components/landing/hero';

export default async function Home() {
  return (
      <div className="container mx-auto">
        <Hero />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Welcome to Ronza4Chat!</h2>
          <p className="text-muted-foreground mt-2">
            The chat application is being set up. Public rooms will appear here soon.
          </p>
        </div>
      </div>
  );
}

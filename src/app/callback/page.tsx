'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // This page handles the redirect from Spotify OAuth
    // The actual token handling is done in the API route
    // This is just a loading page while the redirect happens
    router.push('/auth');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-4">
          Completing Authentication...
        </h1>
        <p className="text-gray-300">
          Please wait while we connect your Spotify account.
        </p>
      </div>
    </main>
  );
}

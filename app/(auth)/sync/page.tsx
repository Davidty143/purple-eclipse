'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthSyncPage() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') ?? '/';

  useEffect(() => {
    window.location.href = next;
  }, [next]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md px-4 py-8 space-y-6 border rounded-md shadow-md bg-white">
        {/* Header skeleton */}
        <div className="space-y-2 text-center">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Body skeleton (e.g., simulating avatar or sign-in state) */}
        <div className="flex items-center justify-center">
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

        {/* Progress bar skeleton */}
        <Skeleton className="h-2 w-full rounded" />

        {/* Fallback message */}
        <p className="text-sm text-center text-gray-500">Redirecting to your destination...</p>
      </div>
    </main>
  );
}

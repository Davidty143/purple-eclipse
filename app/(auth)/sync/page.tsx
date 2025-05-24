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

  return <main className="flex items-center justify-center min-h-screen"></main>;
}

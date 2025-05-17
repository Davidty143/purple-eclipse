'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { memo, useMemo } from 'react';

const LazyLoggedInHeaderRight = memo(
  dynamic(() => import('./LoggedInHeaderRight'), {
    loading: () => (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
    ),
    ssr: false
  })
);

const LazyLoggedOutHeaderRight = memo(
  dynamic(() => import('./LoggedOutHeaderRight'), {
    loading: () => (
      <div className="flex items-center gap-4">
        {/* Login button skeleton (always visible) */}
        <Skeleton className="h-10 w-24 rounded-lg" />

        <Skeleton className="h-10 w-24 rounded-lg hidden md:block" />
      </div>
    ),
    ssr: false
  })
);

function AuthHeaderContent() {
  const { user, isLoading } = useAuth();

  return useMemo(() => {
    if (isLoading) return null;

    return user ? <LazyLoggedInHeaderRight /> : <LazyLoggedOutHeaderRight />;
  }, [user, isLoading]);
}

export default memo(AuthHeaderContent);

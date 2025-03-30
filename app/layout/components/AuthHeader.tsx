// components/AuthHeader.tsx
"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { memo, useMemo } from "react";

// Memoize the lazy-loaded components
const LazyLoggedInHeaderRight = memo(
  dynamic(() => import("./LoggedInHeaderRight"), {
    loading: () => (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-md" />
      </div>
    ),
    ssr: false,
  })
);

const LazyLoggedOutHeaderRight = memo(
  dynamic(() => import("./LoggedOutHeaderRight"), {
    loading: () => (
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    ),
    ssr: false,
  })
);

function AuthHeaderContent() {
  const { user, isLoading } = useAuth();

  return useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      );
    }

    return user ? <LazyLoggedInHeaderRight /> : <LazyLoggedOutHeaderRight />;
  }, [user, isLoading]);
}

export default memo(AuthHeaderContent);

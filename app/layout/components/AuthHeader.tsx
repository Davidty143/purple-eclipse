// components/AuthHeader.tsx
"use client";

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load both header components with custom loading states
const LazyLoggedInHeaderRight = dynamic(() => import("./LoggedInHeaderRight"), {
  loading: () => (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-24 rounded-md" />
    </div>
  ),
  ssr: false, // Disable server-side rendering for these
});

const LazyLoggedOutHeaderRight = dynamic(
  () => import("./LoggedOutHeaderRight"),
  {
    loading: () => (
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    ),
    ssr: false,
  }
);

export default function AuthHeader() {
  const { user, isLoading } = useAuth();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    );
  }

  // Render the appropriate lazy-loaded component
  return user ? <LazyLoggedInHeaderRight /> : <LazyLoggedOutHeaderRight />;
}

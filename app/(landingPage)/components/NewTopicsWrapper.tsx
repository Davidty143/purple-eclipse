'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/app/components/error-boundary';

// Inline fallback skeleton for the NewTopics
const NewTopicsSkeletons = () => (
  <div className="w-full sm:w-[300px] space-y-4 rounded-md border">
    {/* Skeleton for the header */}
    <div className="flex items-center gap-2 px-5 py-3 rounded-md bg-[#edf4f2]">
      <div className="p-1  rounded">
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-5 w-24 rounded" />
    </div>

    {/* Skeletons for each thread */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2 w-full">
        {/* Avatar Skeleton */}
        <Skeleton className="h-8 w-8 rounded-full" />

        {/* Thread title skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-24" />
        </div>
      </div>
    ))}

    {/* Skeleton for the "Show More" button */}
    <div className="px-4 py-2">
      <Skeleton className="h-6 w-full rounded" />
    </div>
  </div>
);

// Dynamically load the NewTopics component with the skeleton as fallback
const NewTopics = dynamic(() => import('./NewTopics').then((mod) => mod.NewTopics), {
  ssr: false,
  loading: () => <NewTopicsSkeletons /> // Display loading skeleton
});

// Error UI component when there's an error
const ErrorUI = () => (
  <div className="w-full sm:w-[300px] p-3 rounded-lg bg-gray-50 border border-gray-200 text-center">
    <p className="text-sm text-gray-600">Unable to load new topics.</p>
  </div>
);

export default function NewTopicsWrapper() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <div className="w-full xl:w-[300px]">
        <NewTopics />
      </div>
    </ErrorBoundary>
  );
}

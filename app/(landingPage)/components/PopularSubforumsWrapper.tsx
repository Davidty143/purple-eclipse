'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/app/components/error-boundary';

// Inline fallback that shows 5 subforums, each with 5 thread skeletons
const Fallback = () => (
  <div className="space-y-6">
    {[...Array(5)].map((_, subforumIdx) => (
      <div key={subforumIdx} className="border rounded-lg space-y-4 w-full">
        {/* Subforum title skeleton */}

        <div className="border-b p-4 w-full">
          <Skeleton className="h-6 w-40 rounded" />
        </div>
        {/* 5 thread skeletons per subforum */}
        {[...Array(5)].map((_, threadIdx) => (
          <div key={threadIdx} className="flex items-start gap-4 py-3 px-2">
            {/* Avatar Skeleton */}
            <Skeleton className="h-12 w-12 rounded-full mt-1 flex-shrink-0" />

            {/* Right Side */}
            <div className="flex-1 min-w-0 mt-1.5 space-y-2">
              {/* Top row: tag + title */}
              <div className="flex items-center gap-2 overflow-hidden">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-1/3 rounded " />
              </div>

              {/* Bottom row: username + date */}
              <Skeleton className="h-4 w-40 " />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// Dynamically load the component with the fallback
const PopularSubforumsGrid = dynamic(() => import('./PopularSubforums').then((mod) => mod.PopularSubforumsGrid), {
  ssr: false,
  loading: () => <Fallback />
});

// Error UI
const ErrorUI = () => (
  <div className="p-6 rounded-lg bg-gray-50 border border-gray-200 text-center">
    <p className="text-gray-600">Unable to load forums content. Please try again later.</p>
  </div>
);

export default function PopularSubforumsWrapper() {
  return (
    <ErrorBoundary fallback={<ErrorUI />}>
      <PopularSubforumsGrid />
    </ErrorBoundary>
  );
}

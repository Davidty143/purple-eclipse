'use client';

import { PopularSubforumsGrid } from './PopularSubforums';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/app/components/error-boundary';

const Fallback = () => (
  <div className="space-y-6">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="w-full border rounded-lg p-4">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    ))}
  </div>
);

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

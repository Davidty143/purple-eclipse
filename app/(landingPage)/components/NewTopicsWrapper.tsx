'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/app/components/error-boundary';

const NewTopicsSkeletons = () => (
  <div className="w-full sm:w-[300px] space-y-3">
    <Skeleton className="h-5 w-24" />
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-20" />
        </div>
      </div>
    ))}
  </div>
);

const NewTopics = dynamic(() => import('./NewTopics').then((mod) => mod.NewTopics), {
  ssr: false,
  loading: () => <NewTopicsSkeletons />
});

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

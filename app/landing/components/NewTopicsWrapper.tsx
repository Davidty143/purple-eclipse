import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import NewTopics from '../../(landingPage)/components/NewTopics';

// Skeleton for the NewTopics component
const NewTopicsSkeleton = () => (
  <div className="w-[300px]">
    <div className="bg-gray-50 h-12 rounded-t-lg border border-gray-300 flex items-center px-4">
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="p-3 border-x border-b border-gray-300 rounded-b-lg space-y-3">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-3 w-full max-w-[160px] mb-1" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
        ))}
    </div>
  </div>
);

const NewTopicsWrapper = () => {
  return (
    <Suspense fallback={<NewTopicsSkeleton />}>
      <NewTopics />
    </Suspense>
  );
};

export default NewTopicsWrapper;

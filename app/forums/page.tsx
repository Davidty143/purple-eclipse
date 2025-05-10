
'use client';

import dynamic from 'next/dynamic';

import BodyHeader from '@/components/BodyHeader';
import { ForumComponentWrapper } from './components/ForumComponentWrapper';
import { Skeleton } from '@/components/ui/skeleton';

// Directly inlined skeleton fallback for NewTopics
const NewTopics = dynamic(() => import('@/app/landing-page/components/NewTopics').then((mod) => mod.NewTopics), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full lg:w-[300px] space-y-4 rounded-md border">
      {/* Header skeleton */}
      <div className="flex items-center gap-2 px-5 py-1.5 rounded-md border-b">
        <div className="p-1 rounded">
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-5 w-24 rounded" />
      </div>

      {/* Thread skeletons */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2 w-full">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      ))}

      {/* Show more button skeleton */}
      <div className="px-4 py-2">
        <Skeleton className="h-6 w-full rounded" />
      </div>
    </div>
  )
});

const ForumsPage = () => {
  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            <BodyHeader />
            <ForumComponentWrapper />
          </div>

          {/* Sidebar */}
          <div className="flex-shrink-0 flex flex-col">
            <NewTopics />
          </div>
        </div>
        <footer className="w-full mt-auto py-4"></footer>
      </div>
    </div>
  );
};

export default ForumsPage;

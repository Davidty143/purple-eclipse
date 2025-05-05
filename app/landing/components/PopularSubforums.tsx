import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SubforumBlock } from '@/app/(landingPage)/components/SubforumBlock';
import { SubforumSkeleton } from '@/app/(landingPage)/components/SubforumSkeleton';

export async function PopularSubforumsGrid() {
  // Sample subforum data
  const subforums = [
    {
      subforum_id: 1,
      subforum_name: 'Programming',
      subforum_description: 'Discuss programming topics',
      subforum_icon: 'Code'
    },
    {
      subforum_id: 2,
      subforum_name: 'Technology',
      subforum_description: 'Tech discussions',
      subforum_icon: 'Cpu'
    },
    {
      subforum_id: 3,
      subforum_name: 'Lifestyle',
      subforum_description: 'Lifestyle topics',
      subforum_icon: 'Coffee'
    }
  ];

  return (
    <div className="space-y-6 w-full">
      <Suspense fallback={<SubforumsLoadingSkeleton />}>
        <h2 className="text-2xl font-bold text-gray-800">Popular Subforums</h2>
        <div className="space-y-6">
          {subforums.map((subforum) => (
            <SubforumBlock key={subforum.subforum_id} subforum={subforum} />
          ))}
        </div>
      </Suspense>
    </div>
  );
}

const SubforumsLoadingSkeleton = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Popular Subforums</h2>
    <div className="space-y-6">
      <SubforumSkeleton />
      <SubforumSkeleton />
      <SubforumSkeleton />
    </div>
  </div>
);

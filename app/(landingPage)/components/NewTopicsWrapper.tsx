'use client';
import dynamic from 'next/dynamic';
import BodyHeader from '@/components/BodyHeader';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import PopularSubforumsWrapper from './components/PopularSubforumsWrapper';

// Inline fallback skeleton for the NewTopics (visible + lifted)
const NewTopicsSkeletons = () => (
  <div className="w-full sm:w-[300px] space-y-4 rounded-md border -mt-8">
    {/* Skeleton for the header */}
    <div className="flex items-center gap-2 px-5 py-3 rounded-md bg-green-200">
      <div className="p-1 rounded">
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-5 w-24 rounded" />
    </div>

    {/* Skeletons for each thread */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2 w-full">
        <Skeleton className="h-8 w-8 rounded-full" />
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
const NewTopics = dynamic(() => import('./components/NewTopics').then((mod) => mod.NewTopics), {
  ssr: false,
  loading: () => <NewTopicsSkeletons />
});

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="flex justify-center py-8 flex-grow">
        <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
          <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
            {/* Left Column */}
            <div className="w-full flex flex-col gap-4">
              <BodyHeader />
              <div className="h-1 w-full bg-[#308b6a] rounded-full mt-3 mb-3"></div>
              <PopularSubforumsWrapper />
            </div>

            {/* Right Column */}
            <div className="flex flex-1 flex-col space-y-14 max-h-auto h-auto">
              {/* Dynamically load NewTopics with visible & lifted skeleton */}
              <NewTopics />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

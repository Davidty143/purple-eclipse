'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import SubforumHeader from './components/SubforumHeader';
import { NoSubforumData } from './components/NoSubforumData';

import { Skeleton } from '@/components/ui/skeleton';

import { SubforumTopics } from './components/SubforumTopics';

// Define skeleton fallback for NewTopics
const NewTopicsSkeletons = () => (
  <div className="w-full h-full sm:w-[300px] space-y-4 rounded-md border">
    {/* Skeleton for the header */}
    <div className="flex items-center gap-2 px-5 py-1.5 rounded-md border-b">
      <div className="p-1 rounded">
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-5 w-24 rounded" />
    </div>

    {/* Skeletons for each thread */}
    {[...Array(6)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-4 py-2 w-full">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    ))}

    {/* Skeleton for the "Show More" button */}
    <div className="px-4 py-2">
      <Skeleton className="h-6 w-full rounded" />
    </div>
  </div>
);

// Dynamically import NewTopics with fallback skeleton
const NewTopics = dynamic(() => import('@/app/landing-page/components/NewTopics').then((mod) => mod.NewTopics), { ssr: false, loading: () => <NewTopicsSkeletons /> });

interface SubforumData {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  deleted: boolean;
  forumId: number;
  created: string;
  modified: string;
}

// Define skeleton fallback for Subforum Header
const SubforumHeaderSkeleton = () => (
  <div className="pt-6 pb-6 px-4 bg-white rounded-lg shadow-sm animate-pulse space-y-2 border">
    {/* Skeleton for the header with two adjacent items */}
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded" />

      {/* Title Skeleton with three adjacent placeholders */}
      <div className="flex space-x-4">
        <div className="h-7 w-36 bg-gray-100 rounded" />
        <div className="h-7 w-7 bg-gray-100 rounded" />
        <div className="h-7 w-7 bg-gray-100 rounded" />
      </div>

      {/* Button aligned to the right */}
      <button className="ml-auto px-16 py-4 bg-gray-100 rounded-md hidden sm:block" />
    </div>

    {/* Additional Description or Placeholder */}
    <div className="h-8 w-full bg-gray-100 rounded sm:hidden " />
    <div className="h-5 w-1/2 bg-gray-100 rounded" />
  </div>
);

export default function SubforumPage() {
  const params = useParams();
  const subforumId = params?.subforumId as string;

  const [subforum, setSubforum] = useState<SubforumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/subforums/${subforumId}`);
        if (!response.ok) throw new Error('Subforum not found');

        const data = await response.json();
        setSubforum(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (subforumId) fetchData();
  }, [subforumId]);

  const handleEditSuccess = (updatedSubforum: SubforumData) => {
    setSubforum((prev) => ({ ...prev, ...updatedSubforum }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) return <NoSubforumData error={error} />;
  if (!subforum && !loading) return <NoSubforumData />;

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            {loading ? <SubforumHeaderSkeleton /> : <SubforumHeader title={subforum!.name} description={subforum!.description} subforumId={Number(subforumId)} icon={subforum!.icon} onEditSuccess={handleEditSuccess} />}

            <SubforumTopics subforumId={Number(subforumId)} page={currentPage} limit={pageSize} onPageChange={handlePageChange} />
          </div>

          {/* Sidebar with skeleton */}
          <div className="flex-shrink-0 flex flex-col">
            <NewTopics />
          </div>
        </div>
        <footer className="w-full mt-auto py-4"></footer>
      </div>
    </div>
  );
}

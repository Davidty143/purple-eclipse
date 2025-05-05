'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SubforumHeader from './components/SubforumHeader';
import { NoSubforumData } from './components/NoSubforumData';
import { Loader2 } from 'lucide-react';
import { NewTopics } from '@/app/landingPage/components/NewTopics';
import { SubforumTopics } from './components/SubforumTopics';

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

export default function SubforumPage() {
  const params = useParams();
  const subforumId = params?.subforumId as string;

  const [subforum, setSubforum] = useState<SubforumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [totalPages, setTotalPages] = useState(1); // Total pages for pagination

  const pageSize = 10; // Number of items per page

  useEffect(() => {
    const fetchData = async () => {
      if (!subforumId) {
        console.error('[FETCH] SubforumId is missing');
        setError('Subforum ID is missing');
        setLoading(false);
        return;
      }

      console.log('[FETCH] Getting subforum:', subforumId);
      try {
        const response = await fetch(`/api/subforums/${subforumId}`);

        if (!response.ok) {
          console.error('[FETCH] Failed to fetch subforum:', response.status);
          throw new Error('Subforum not found');
        }

        const data = await response.json();
        console.log('[FETCH] Subforum data:', data);
        setSubforum(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ERROR] Fetching subforum:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (subforumId) {
      fetchData();
    } else {
      setLoading(false);
      setError('Subforum ID is missing');
    }
  }, [subforumId]);

  const handleEditSuccess = (updatedSubforum: SubforumData) => {
    console.log('[EDIT SUCCESS] Received updated subforum:', updatedSubforum);

    // Use full object if you trust backend, or merge for safety
    setSubforum((prev) => {
      console.log('[STATE] Before update:', prev);
      const next = { ...prev, ...updatedSubforum };
      console.log('[STATE] After update:', next);
      return next;
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    console.log('[RENDER] Current subforum state:', subforum);
  }, [subforum]);

  if (loading) {
    console.log('[RENDER] Loading...');
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    console.warn('[RENDER] Showing error fallback:', error);
    return <NoSubforumData error={error} />;
  }

  if (!subforum) {
    console.warn('[RENDER] Subforum is null, showing fallback');
    return <NoSubforumData />;
  }

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            <SubforumHeader title={subforum.name} description={subforum.description} subforumId={Number(subforumId)} icon={subforum.icon} onEditSuccess={handleEditSuccess} />

            {/* Subforum Topics with Pagination */}
            <SubforumTopics
              subforumId={Number(subforumId)}
              page={currentPage}
              limit={pageSize}
              onPageChange={handlePageChange} // Pagination handler
            />
          </div>

          {/* Sidebar */}
          <div className="flex-shrink-0 flex flex-col space-y-6">
            <NewTopics />
          </div>
        </div>
        <footer className="w-full mt-auto py-4"></footer>
      </div>
    </div>
  );
}

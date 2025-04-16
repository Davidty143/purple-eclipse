'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SubforumHeader from './components/SubforumHeader';
import { NoSubforumData } from './components/NoSubforumData';
import { Loader2 } from 'lucide-react';
import { NewTopics } from '@/app/(landingPage)/components/NewTopics';
import { SubforumTopics } from './components/SubforumTopics';

interface SubforumData {
  id: string;
  name: string;
  description: string;
}

export default function SubforumPage() {
  const params = useParams();
  const [subforum, setSubforum] = useState<SubforumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock subforum data fetch
    const fetchData = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setSubforum({
          id: params.subforumId as string,
          name: 'ACADEMICS',
          description: 'Ask for academic assistance, get the support you need, and help others succeed!'
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.subforumId) {
      fetchData();
    }
  }, [params.subforumId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <NoSubforumData error={error} />;
  }

  if (!subforum) {
    return <NoSubforumData />;
  }

  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-6">
            <SubforumHeader title={subforum.name} description={subforum.description} />
            <SubforumTopics />
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

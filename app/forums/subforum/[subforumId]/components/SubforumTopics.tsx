'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThreadRow } from './SubforumThreadRow';
import { createBrowserClient } from '@supabase/ssr';
import { ShadPaginationNav } from '@/components/ShadPaginationNav';

interface SubforumTopicsProps {
  subforumId: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  tag: string;
  createdAt: Date;
  comments: { count: number }[];
  views: number;
}

interface DatabaseThread {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_content: string;
  thread_modified: string;
  Comment: { count: number }[];
  author: {
    account_username: string | null;
    account_email: string | null;
    account_avatar_url?: string | null;
  };
}

export function SubforumTopics({ subforumId, page, limit, onPageChange }: SubforumTopicsProps) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalThreads, setTotalThreads] = useState<number>(0);

  const handleThreadClick = (threadId: string) => {
    router.push(`/thread/${threadId}`);
  };

  useEffect(() => {
    const fetchThreads = async () => {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      try {
        const { data, error, count } = await supabase
          .from('Thread')
          .select(
            `
            thread_id,
            thread_title,
            thread_created,
            thread_content,
            thread_modified,
            author:author_id (
              account_username,
              account_email,
              account_avatar_url
            ),
            Comment (
              count
            )
          `,
            { count: 'exact' }
          )
          .eq('subforum_id', subforumId)
          .eq('thread_deleted', false)
          .order('thread_created', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)
          .returns<DatabaseThread[]>();

        if (error) {
          console.error('Supabase error details:', error);
          throw error;
        }

        if (!data) {
          console.error('No data returned from Supabase');
          throw new Error('No data returned from database');
        }

        const formattedThreads: Thread[] = data.map((thread) => ({
          id: thread.thread_id.toString(),
          title: thread.thread_title,
          author: {
            name: thread.author?.account_username || 'Anonymous',
            avatar: thread.author?.account_avatar_url?.trim() || undefined
          },
          tag: 'Discussion',
          createdAt: new Date(thread.thread_created),
          comments: thread.Comment ? [{ count: thread.Comment[0]?.count || 0 }] : [{ count: 0 }],
          views: 0
        }));

        setThreads(formattedThreads);
        setTotalThreads(count || 0);
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError('Failed to load threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [subforumId, page, limit]);

  const totalPages = Math.ceil(totalThreads / limit);

  return (
    <div className="space-y-4">
      {loading && (
        <>
          <div className="mb-4 flex justify-end">
            <PaginationSkeleton />
          </div>
          {Array.from({ length: limit }).map((_, i) => (
            <ThreadRowSkeleton key={i} />
          ))}
        </>
      )}

      {!loading && error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {totalPages > 1 && (
            <div className="mb-4 flex justify-end">
              <ShadPaginationNav currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          )}

          {threads.map((thread) => (
            <div key={thread.id} onClick={() => handleThreadClick(thread.id)} className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg">
              <ThreadRow thread={thread} />
            </div>
          ))}

          {threads.length === 0 && <div className="text-center py-8 text-gray-500">No threads found in this subforum</div>}
        </>
      )}
    </div>
  );
}

// 🧱 Thread skeleton
function ThreadRowSkeleton() {
  return (
    <div className="p-4 bg-white rounded-md shadow-sm animate-pulse space-y-2 border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex space-x-4">
            <div className="h-4 w-1/4 bg-gray-100 rounded" />

            <div className="h-4 w-2/3 bg-gray-100 rounded" />
          </div>

          <div className="h-3 w-1/2 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

// 🧱 Pagination skeleton
function PaginationSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
      <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" />
      <div className="w-14 h-8 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

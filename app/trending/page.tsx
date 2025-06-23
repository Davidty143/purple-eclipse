'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShadPaginationNav } from '@/components/ShadPaginationNav';

const PAGE_SIZE = 10;

type Thread = {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_category: string;
  author: {
    account_username: string;
    account_email: string;
    account_avatar_url: string | null;
  } | null;
  comments: { count: number }[];
};

type TimeFilter = 'today' | 'week' | 'month';

export default function TrendingPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalThreads, setTotalThreads] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  useEffect(() => {
    const fetchTrendingThreads = async () => {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      setLoading(true);

      try {
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const now = new Date();
        let startDate = new Date();
        switch (timeFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        const { data: commentData, error: commentError } = await supabase.from('Comment').select('thread_id, comment_created').gte('comment_created', startDate.toISOString());

        if (commentError) throw commentError;

        if (!commentData || commentData.length === 0) {
          const {
            data: threadsData,
            error: threadsError,
            count
          } = await supabase
            .from('Thread')
            .select(
              `
              thread_id,
              thread_title,
              thread_created,
              thread_category,
              thread_deleted,
              author:Account!author_id (
                account_username,
                account_email,
                account_avatar_url
              )
            `,
              { count: 'exact', head: false }
            )
            .eq('thread_deleted', false)
            .gte('thread_created', startDate.toISOString())
            .order('thread_created', { ascending: false })
            .range(from, to);

          if (threadsError) {
            console.error('Supabase threadsError:', threadsError);
            setThreads([]);
            setTotalThreads(0);
            setLoading(false);
            return;
          }

          const threadsWithCounts: Thread[] = (threadsData || []).map((thread) => ({
            ...thread,
            author: Array.isArray(thread.author) ? thread.author[0] || null : thread.author ?? null,
            comments: [{ count: 0 }]
          }));

          setThreads(threadsWithCounts);
          setTotalThreads(count || 0);
          setLoading(false);
          return;
        }

        const commentCountMap = commentData.reduce((acc, { thread_id }) => {
          acc[thread_id] = (acc[thread_id] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const sortedThreadIds = Object.entries(commentCountMap)
          .sort((a, b) => b[1] - a[1])
          .map(([thread_id]) => Number(thread_id));

        const paginatedThreadIds = sortedThreadIds.slice(from, to);

        if (paginatedThreadIds.length === 0) {
          setThreads([]);
          setTotalThreads(0);
          setLoading(false);
          return;
        }

        const { data: threadsData, error: threadsError } = await supabase
          .from('Thread')
          .select(
            `
            thread_id,
            thread_title,
            thread_created,
            thread_category,
            thread_deleted,
            author:Account!author_id (
              account_username,
              account_email,
              account_avatar_url
            )
          `,
            { head: false }
          )
          .eq('thread_deleted', false)
          .in('thread_id', paginatedThreadIds);

        if (threadsError) {
          console.error('Supabase threadsError:', threadsError);
          setThreads([]);
          setTotalThreads(0);
          setLoading(false);
          return;
        }

        if (!threadsData || threadsData.length === 0) {
          setThreads([]);
          setTotalThreads(sortedThreadIds.length);
          setLoading(false);
          return;
        }

        // Filter out any threads that might have been deleted since the initial query
        const activeThreads = threadsData.filter((thread) => !thread.thread_deleted);

        const threadsWithCounts: Thread[] = activeThreads.map((thread) => ({
          ...thread,
          author: Array.isArray(thread.author) ? thread.author[0] || null : thread.author ?? null,
          comments: [{ count: commentCountMap[thread.thread_id] || 0 }]
        }));

        setThreads(threadsWithCounts);
        setTotalThreads(sortedThreadIds.length);
      } catch (error) {
        if (error && typeof error === 'object') {
          console.error('Error fetching trending threads:', error, Object.keys(error), { currentPage, timeFilter });
        } else {
          console.error('Error fetching trending threads:', error, { currentPage, timeFilter });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingThreads();
  }, [currentPage, timeFilter]);

  const totalPages = Math.ceil(totalThreads / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="container mx-auto px-4 max-w-[1250px] 2xl:max-w-[80%]">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl md:text-2xl font-bold">Trending Discussions</CardTitle>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button onClick={() => setTimeFilter('today')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeFilter === 'today' ? 'bg-[#2b7a58] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Today
                </button>
                <button onClick={() => setTimeFilter('week')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeFilter === 'week' ? 'bg-[#2b7a58] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  This Week
                </button>
                <button onClick={() => setTimeFilter('month')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${timeFilter === 'month' ? 'bg-[#2b7a58] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  This Month
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-white animate-pulse border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 bg-gray-200 rounded" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded" />
                      <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => (
                  <Link key={thread.thread_id} href={`/thread/${thread.thread_id}`} className="block">
                    <div className="p-4 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 shrink-0">
                          <AvatarImage src={thread.author?.account_avatar_url || ''} alt={thread.author?.account_username || 'Anonymous'} />
                          <AvatarFallback>{thread.author?.account_username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {thread.thread_category && (
                              <Badge variant="secondary" className="bg-[#2b7a58] text-white hover:bg-[#267858] text-xs px-2 py-0.5">
                                {thread.thread_category}
                              </Badge>
                            )}
                            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">{thread.thread_title}</h2>
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-x-2">
                            <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
                            <span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                            <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                            <span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                            <span className="text-[#2b7a58] font-medium">{thread.comments[0]?.count || 0} comments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

                {threads.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">No trending discussions found for this time period</p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 mb-2">
                    <ShadPaginationNav currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

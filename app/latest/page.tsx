'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/app/utils/supabase/client';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ShadPaginationNav } from '@/components/ShadPaginationNav';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface DatabaseAuthor {
  account_username: any;
  account_email: any;
  account_avatar_url: any;
}

interface DatabaseResponse {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_category: string | null;
  author_id: number;
  author: DatabaseAuthor | DatabaseAuthor[];
  comments: { count: number }[];
}

interface Thread {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_category: string | null;
  author: {
    account_username: string | null;
    account_email: string | null;
    account_avatar_url: string | null;
  };
  comments: { count: number }[];
}

const PAGE_SIZE = 10;

// Helper to normalize author structure
const normalizeAuthor = (author: any): Thread['author'] => {
  const normalized = Array.isArray(author) ? author[0] : author;
  return {
    account_username: normalized?.account_username || 'Anonymous',
    account_email: normalized?.account_email || null,
    account_avatar_url: normalized?.account_avatar_url || null
  };
};

export default function LatestPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalThreads, setTotalThreads] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchThreads = async () => {
      const supabase = createClient();
      try {
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from('Thread')
          .select(
            `
            thread_id,
            thread_title,
            thread_created,
            thread_category,
            author_id,
            author:Account!author_id (
              account_username,
              account_email,
              account_avatar_url
            ),
            comments:Comment (count)
          `,
            { count: 'exact' }
          )
          .eq('thread_deleted', false)
          .order('thread_created', { ascending: false });

        // Add category filter if selected and not 'all'
        if (selectedCategory && selectedCategory !== 'all') {
          query = query.eq('thread_category', selectedCategory);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) {
          console.error('Error fetching threads:', error);
          throw error;
        }

        const formattedData = (data || []).map((thread: DatabaseResponse) => ({
          thread_id: thread.thread_id,
          thread_title: thread.thread_title,
          thread_created: thread.thread_created,
          thread_category: thread.thread_category,
          author: normalizeAuthor(thread.author),
          comments: thread.comments || []
        }));

        setThreads(formattedData);
        setTotalThreads(count || 0);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [currentPage, selectedCategory]);

  const totalPages = Math.ceil(totalThreads / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex justify-center py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-[1250px] 2xl:max-w-[80%] flex flex-col">
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Latest Threads</h1>
            <div className="w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Help">Help</SelectItem>
                  <SelectItem value="Discussion">Discussion</SelectItem>
                  <SelectItem value="Question">Question</SelectItem>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="News">News</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-0">
              {loading
                ? Array.from({ length: PAGE_SIZE }).map((_, idx) => (
                    <div key={idx} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-100">
                      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 sm:h-5 w-32" />
                        <Skeleton className="h-3 sm:h-4 w-full" />
                        <Skeleton className="h-3 sm:h-4 w-48" />
                      </div>
                    </div>
                  ))
                : threads.map((thread) => (
                    <Link href={`/thread/${thread.thread_id}`} key={thread.thread_id}>
                      <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">{thread.author?.account_avatar_url ? <AvatarImage src={thread.author.account_avatar_url} /> : <AvatarFallback>{getInitials(thread.author?.account_username || 'Anonymous')}</AvatarFallback>}</Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2 mb-1">
                            {thread.thread_category && (
                              <Badge variant="secondary" className="bg-[#267858] text-white hover:bg-[#267858] text-xs sm:text-sm">
                                {thread.thread_category}
                              </Badge>
                            )}
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-full">{thread.thread_title}</h2>
                          </div>

                          <div className="text-xs sm:text-sm text-gray-500">
                            Posted by {thread.author?.account_username || 'Anonymous'}
                            {' • '}
                            {format(new Date(thread.thread_created), 'MMM d, yyyy')}
                            {' • '}
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {thread.comments[0]?.count || 0} replies
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <ShadPaginationNav currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createCachedFetch, invalidateCache } from '@/lib/use-cached-fetch';
import { createClient } from '@/app/utils/supabase/client';

import { Flame } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link'; // Import Link

// Thread type
interface Thread {
  id: string;
  title: string;
  author: {
    account_username: string | null;
    account_email: string | null;
    account_avatar_url?: string | null;
  };
}

// Fetch threads
const fetchNewThreads = async (): Promise<Thread[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('Thread')
      .select(
        `
        thread_id,
        thread_title,
        thread_created,
        author:author_id (
          account_username,
          account_email,
          account_avatar_url
        )
      `
      )
      .eq('thread_deleted', false)
      .order('thread_created', { ascending: false })
      .limit(30);

    if (error) throw new Error(error.message);

    return (data || []).map((thread: any) => ({
      id: String(thread.thread_id),
      title: thread.thread_title,
      author: {
        account_username: thread.author?.account_username || null,
        account_email: thread.author?.account_email || null,
        account_avatar_url: thread.author?.account_avatar_url || null
      }
    }));
  } catch (err) {
    console.error('Error fetching new threads:', err);
    return [];
  }
};

const getNewThreadsData = createCachedFetch<Thread[]>('new-topics', fetchNewThreads, { ttl: 3 * 60 * 1000 });

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  return parts.length === 1
    ? parts[0].charAt(0).toUpperCase()
    : parts
        .slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase())
        .join('');
};

const AvatarWithFallback = ({ author }: { author: Thread['author'] }) => {
  const username = author.account_username || 'Anonymous';
  const initials = getInitials(username);
  return <Avatar className="w-8 h-8 shrink-0">{author.account_avatar_url?.trim() ? <AvatarImage src={author.account_avatar_url} alt={username} /> : <AvatarFallback className="text-xs">{initials}</AvatarFallback>}</Avatar>;
};

export function NewTopics() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshThreads = async () => {
    setLoading(true);
    try {
      // Invalidate the cache to force a fresh fetch
      invalidateCache('new-topics');
      const data = await getNewThreadsData();
      setThreads(data || []);
    } catch (error) {
      console.error('Error refreshing threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshThreads();

    // Set up real-time subscription for thread changes
    const supabase = createClient();
    const subscription = supabase
      .channel('thread-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'Thread'
        },
        () => {
          // Refresh threads when any change occurs
          refreshThreads();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleShowMore = () => {
    if (visibleCount >= 20) {
      router.push('/new-topics');
    } else {
      setVisibleCount((prev) => prev + 10);
    }
  };

  const displayedThreads = threads.slice(0, visibleCount);
  const hasMore = threads.length > visibleCount;

  const threadItems =
    displayedThreads.length > 0 ? (
      displayedThreads.map((thread) => (
        <Link key={thread.id} href={`/thread/${thread.id}`} passHref>
          <div className="flex items-center gap-3 px-4 py-2 w-full overflow-hidden cursor-pointer hover:bg-gray-100 rounded-md">
            <AvatarWithFallback author={thread.author} />
            <div className="text-sm font-medium text-gray-800 line-clamp-1 w-full">{thread.title}</div>
          </div>
        </Link>
      ))
    ) : (
      <div key="no-topics" className="py-3 text-center text-muted-foreground text-sm">
        No recent topics
      </div>
    );

  return (
    <Card className="w-full lg:w-[300px] p-0 rounded-lg border border-gray-300">
      <CardHeader className="pb-3.5 px-5 pt-3.5 border-b rounded-t-lg bg-[#edf4f2]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#267858] rounded">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-base text-start font-medium">New Topics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-0 pt-5 pb-4">
        {threadItems}
        {hasMore && (
          <Button variant="ghost" size="sm" className="justify-start lg:justify-center w-full text-gray-600 hover:font-semibold hover:bg-white" onClick={handleShowMore}>
            Show More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default NewTopics;

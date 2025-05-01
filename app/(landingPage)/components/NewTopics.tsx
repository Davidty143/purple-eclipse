'use client';

import { useState,use } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SidebarThreadRow } from './SidebarThreadRow';
import { createClient } from '@/utils/supabase/client';
import { createCachedFetch } from '@/lib/use-cached-fetch';

// Match the interface from SidebarThreadRow
interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string; // Optional string only, not null
  };
}

// Create a suspense-ready data fetcher
const fetchNewThreads = async (): Promise<Thread[]> => {
  try {
    const supabase = createClient();

    // Fetch latest threads across all subforums
    const { data, error } = await supabase
      .from('Thread')
      .select(
        `
        thread_id,
        thread_title,
        thread_created,
        author:author_id(
          account_username,
          account_email,
          account_avatar_url
        )
      `
      )
      .eq('thread_deleted', false)
      .order('thread_created', { ascending: false })
      .limit(15);

    if (error) {
      throw new Error(error.message);
    }

    // Transform data to the expected format matching Thread interface
    const threads: Thread[] = (data || []).map((thread: any) => ({
      id: String(thread.thread_id),
      title: thread.thread_title,
      author: {
        name: thread.author?.account_username || 'Anonymous',
        // Ensure avatar is either string or undefined, not null
        avatar: thread.author?.account_avatar_url || undefined
      }
    }));

    return threads;
  } catch (err) {
    console.error('Error fetching new threads:', err);
    // Return empty array on error rather than rejecting to avoid breaking UI
    return [];
  }
};

// Create a cached fetcher with a 3-minute TTL
const getNewThreadsData = createCachedFetch<Thread[]>(
  'new-topics',
  fetchNewThreads,
  { ttl: 3 * 60 * 1000 } // 3 minutes cache
);

export function NewTopics() {
  // Use the React 'use' hook to unwrap the promise in a way that works with Suspense
  const threads = use(getNewThreadsData());
  const [showAll, setShowAll] = useState(false);

  const displayedThreads = showAll ? threads : threads.slice(0, 10);
  const hasMore = threads.length > 10;

  // Ensure we always have the same JSX structure
  const threadItems =
    displayedThreads.length > 0
      ? displayedThreads.map((thread: Thread) => <SidebarThreadRow key={thread.id} thread={thread} />)
      : [
          <div key="no-topics" className="py-3 text-center text-muted-foreground">
            No recent topics
          </div>
        ];

  return (
    <Card className="w-[300px] p-0 rounded-lg border-gray-300">
      <CardHeader className="pb-3 px-4 pt-3 border-b rounded-t-lg bg-gray-50">
        <CardTitle className="text-md text-start font-medium">New Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-2 pt-3 pb-4">
        {threadItems}
        {hasMore && !showAll && (
          <Button variant="ghost" size="sm" className="w-full text-primary text-gray-600 hover:underline hover:font-semibold hover:bg-white" onClick={() => setShowAll(true)}>
            Show More (+{threads.length - 10})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default NewTopics;

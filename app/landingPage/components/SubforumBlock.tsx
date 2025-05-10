'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThreadRow } from './ThreadRow';
import * as Icons from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';

// Types
export interface ThreadAuthor {
  account_username: string | null;
  account_email: string | null;
  account_avatar_url?: string | null;
}

export interface ThreadData {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_category: string | null;
  author: ThreadAuthor;
}

export interface SubforumData {
  subforum_id: number;
  subforum_name: string | null;
  subforum_description: string | null;
  subforum_icon?: string | null;
}

// Fetch threads with category (direct column), author (FK)
const fetchThreadsForSubforum = async (subforumId: number, limit: number = 5): Promise<ThreadData[]> => {
  const supabase = createClient();

  console.log(`Fetching threads for subforumId: ${subforumId}, Limit: ${limit}`);

  const { data, error } = await supabase
    .from('Thread')
    .select(
      `
      thread_id,
      thread_title,
      thread_created,
      thread_category,
      author:author_id (
        account_username,
        account_email,
        account_avatar_url
      )
    `
    )
    .eq('subforum_id', subforumId)
    .eq('thread_deleted', false) // Ensure that you're not fetching deleted threads
    .order('thread_created', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Supabase error:', error.message);
    return [];
  }

  console.log('Fetched data:', data);

  // Ensure thread_category is string | null and map data accordingly
  return (data || []).map((thread: any) => {
    return {
      thread_id: thread.thread_id,
      thread_title: thread.thread_title,
      thread_created: thread.thread_created,
      thread_category: thread.thread_category || null, // Explicitly map null values
      author: {
        account_username: thread.author?.account_username || 'Anonymous',
        account_email: thread.author?.account_email,
        account_avatar_url: thread.author?.account_avatar_url || undefined
      }
    };
  });
};

export function SubforumBlock({ subforum }: { subforum: SubforumData }) {
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(5); // Control the number of threads fetched initially

  useEffect(() => {
    console.log('SubforumBlock useEffect triggered');
    fetchThreadsForSubforum(subforum.subforum_id, limit)
      .then((threads) => {
        console.log('Threads fetched for subforum:', threads);
        setThreads(threads);
      })
      .finally(() => setLoading(false));
  }, [subforum.subforum_id, limit]); // Fetch when limit or subforum_id changes

  const LucideIcon = (Icons[subforum.subforum_icon as keyof typeof Icons] || Icons.MessageSquare) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  return (
    <Card className="w-full border border-gray-300 p-0">
      <CardHeader className="px-8 py-4 bg-[#edf4f2] border-b border-gray-300 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-[#267858] rounded">
            <LucideIcon className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="font-medium text-md">{subforum.subforum_name}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-0 space-y-2 w-full pt-2 pb-2">
        {/* Loading state */}
        {loading ? <div className="py-3 text-center text-muted-foreground">Loading threads...</div> : threads.length > 0 ? threads.map((thread) => <ThreadRow key={thread.thread_id} thread={thread} />) : <div className="px-0 py-3 text-center text-muted-foreground">No threads yet</div>}

        {/* Show more link that goes to the subforum page */}
        {threads.length > 0 && !loading && (
          <div className="text-start pl-6 pb-2">
            <Link href={`/forums/subforum/${subforum.subforum_id}`} passHref>
              <button className="text-sm text-gray-500 hover:text-gray-700 hover:font-medium focus:outline-none">Show more</button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

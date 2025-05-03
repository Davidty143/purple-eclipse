'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SidebarThreadRow } from './SidebarThreadRow';
import { createClient } from '@/utils/supabase/client';
import { createCachedFetch } from '@/lib/use-cached-fetch';
import { Flame } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Match the interface from SidebarThreadRow
interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string; // Optional string only, not null
  };
}

// Fetch new threads function
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

    if (error) throw new Error(error.message);

    const threads: Thread[] = (data || []).map((thread: any) => ({
      id: String(thread.thread_id),
      title: thread.thread_title,
      author: {
        name: thread.author?.account_username || 'Anonymous',
        avatar: thread.author?.account_avatar_url || undefined
      }
    }));

    return threads;
  } catch (err) {
    console.error('Error fetching new threads:', err);
    return [];
  }
};

// Create a cached fetcher with a 3-minute TTL
const getNewThreadsData = createCachedFetch<Thread[]>('new-topics', fetchNewThreads, { ttl: 3 * 60 * 1000 });

// Function to get initials
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
};

// Avatar Fallback Component using Avatar/AvatarImage/AvatarFallback
const AvatarWithFallback = ({ name, avatar }: { name: string; avatar?: string }) => {
  const initials = getInitials(name);
  return <Avatar className="w-8 h-8">{avatar?.trim() ? <AvatarImage src={avatar} alt={name} /> : <AvatarFallback className="text-xs">{initials}</AvatarFallback>}</Avatar>;
};

export function NewTopics() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getNewThreadsData()
      .then((data) => {
        setThreads(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching new threads data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="w-[300px] p-0 rounded-lg border-gray-300">
        <CardHeader className="pb-3 px-5 pt-3 border-b rounded-t-lg bg-[#edf4f2]">
          <CardTitle className="text-md text-start font-medium">New Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-2 pt-3 pb-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-4/5 mb-1 animate-pulse"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    );
  }

  const displayedThreads = showAll ? threads : threads.slice(0, 10);
  const hasMore = threads.length > 10;

  const threadItems =
    displayedThreads.length > 0
      ? displayedThreads.map((thread) => (
          <div key={thread.id} className="flex items-center gap-2 px-4 py-2">
            <AvatarWithFallback name={thread.author.name} avatar={thread.author.avatar} />
            <div className="text-sm font-medium text-gray-800 line-clamp-1">{thread.title}</div>
          </div>
        ))
      : [
          <div key="no-topics" className="py-3 text-center text-muted-foreground">
            No recent topics
          </div>
        ];

  return (
    <Card className="w-full sm:w-[300px] p-0 rounded-lg border border-gray-300">
      <CardHeader className="pb-3.5 px-5 pt-3.5 border-b rounded-t-lg bg-[#edf4f2]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#267858] rounded">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-base text-start bg-[#edf4f2] font-medium">New Topics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-0 pt-3 pb-4">
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

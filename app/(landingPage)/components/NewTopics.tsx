'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createCachedFetch } from '@/lib/use-cached-fetch';
import { createClient } from '@/app/utils/supabase/client';

import { Flame } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
}

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
      .limit(30);

    if (error) throw new Error(error.message);

    return (data || []).map((thread: any) => ({
      id: String(thread.thread_id),
      title: thread.thread_title,
      author: {
        name: thread.author?.account_username || 'Anonymous',
        avatar: thread.author?.account_avatar_url || undefined
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

const AvatarWithFallback = ({ name, avatar }: { name: string; avatar?: string }) => {
  const initials = getInitials(name);
  return <Avatar className="w-8 h-8 shrink-0">{avatar?.trim() ? <AvatarImage src={avatar} alt={name} /> : <AvatarFallback className="text-xs">{initials}</AvatarFallback>}</Avatar>;
};

export function NewTopics() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        <div key={thread.id} className="flex items-center gap-3 px-4 py-2 w-full overflow-hidden">
          <AvatarWithFallback name={thread.author.name} avatar={thread.author.avatar} />
          <div className="text-sm font-medium text-gray-800 line-clamp-1 w-full">{thread.title}</div>
        </div>
      ))
    ) : (
      <div key="no-topics" className="py-3 text-center text-muted-foreground text-sm">
        No recent topics
      </div>
    );

  return (
    <Card className="w-full sm:w-[300px] p-0 rounded-lg border border-gray-300">
      <CardHeader className="pb-3.5 px-5 pt-3.5 border-b rounded-t-lg bg-[#edf4f2]">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#267858] rounded">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-base text-start font-medium">New Topics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-0 pt-3 pb-4">
        {threadItems}
        {hasMore && (
          <Button variant="ghost" size="sm" className="w-full text-primary text-gray-600 hover:underline hover:font-semibold hover:bg-white" onClick={handleShowMore}>
            Show More
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default NewTopics;

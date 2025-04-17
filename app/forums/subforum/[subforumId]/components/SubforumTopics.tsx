// app/forums/subforum/[subforumId]/components/SubforumTopics.tsx
'use client';
import { useEffect, useState } from 'react';
import { ThreadRow } from './SubforumThreadRow';
import { createBrowserClient } from '@supabase/ssr';
import { Thread } from './SubforumThreadRow';

interface SubforumTopicsProps {
  subforumId: number;
}

interface DatabaseThread {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_content: string;
  comments: [{ count: number }] | [];
  author: {
    account_username: string | null;
    account_email: string | null;
    avatar_url: string | null;
  };
}

export function SubforumTopics({ subforumId }: SubforumTopicsProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreads = async () => {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const { data, error } = await supabase
        .from('Thread')
        .select(
          `
          thread_id,
          thread_title,
          thread_created,
          thread_content,
          comments:Comment (count),
          author:author_id (
            account_username,
            account_email,
            avatar_url
          )
        `
        )
        .eq('subforum_id', subforumId)
        .eq('thread_deleted', false)
        .order('thread_created', { ascending: false })
        .returns<DatabaseThread[]>();

      if (!error && data) {
        const formattedThreads: Thread[] = data.map((thread) => ({
          id: thread.thread_id.toString(),
          title: thread.thread_title,
          author: {
            name: thread.author?.account_username || 'Anonymous',
            avatar: thread.author?.avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`
          },
          tag: 'Discussion',
          createdAt: new Date(thread.thread_created),
          replies: thread.comments[0]?.count || 0,
          views: 0
        }));
        setThreads(formattedThreads);
      }
      setLoading(false);
    };

    fetchThreads();
  }, [subforumId]);

  if (loading) {
    return <div>Loading threads...</div>;
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <ThreadRow key={thread.id} thread={thread} />
      ))}
      {threads.length === 0 && <div className="text-center py-8 text-gray-500">No threads found in this subforum</div>}
    </div>
  );
}

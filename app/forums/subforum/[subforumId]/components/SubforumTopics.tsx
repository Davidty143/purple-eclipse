// app/forums/subforum/[subforumId]/components/SubforumTopics.tsx
'use client';
import { useEffect, useState } from 'react';
import { ThreadRow } from './SubforumThreadRow';
import { createBrowserClient } from '@supabase/ssr';
import { Thread } from './SubforumThreadRow';
import { useRouter } from 'next/navigation';

interface SubforumTopicsProps {
  subforumId: number;
}

interface DatabaseThread {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_content: string;
  thread_category?: string;
  comment_count: number;
  author: {
    account_username: string | null;
    account_email: string | null;
  };
}

export function SubforumTopics({ subforumId }: SubforumTopicsProps) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleThreadClick = (threadId: string) => {
    router.push(`/thread/${threadId}`);
  };

  useEffect(() => {
    const fetchThreads = async () => {
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      try {
        const { data, error } = await supabase
          .from('Thread')
          .select(
            `
            thread_id,
            thread_title,
            thread_created,
            thread_content,
            thread_category,
            author:author_id(account_username, account_email),
            comment_count:Comment(count)
          `
          )
          .eq('subforum_id', subforumId)
          .eq('thread_deleted', false)
          .order('thread_created', { ascending: false })
          .returns<DatabaseThread[]>();

        if (error) throw error;

        if (data) {
          const formattedThreads = data.map((thread) => ({
            id: thread.thread_id.toString(),
            title: thread.thread_title,
            author: {
              name: thread.author?.account_username || 'Anonymous',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.author?.account_username || 'A')}&background=random`
            },
            tag: thread.thread_category || 'Discussion',
            createdAt: new Date(thread.thread_created),
            replies: thread.comment_count || 0,
            views: 0
          }));
          setThreads(formattedThreads);
        }
      } catch (err) {
        console.error('Error fetching threads:', err);
        setError('Failed to load threads');
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [subforumId]);

  if (loading) return <div>Loading threads...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {threads.map((thread) => (
        <div key={thread.id} onClick={() => handleThreadClick(thread.id)} className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg">
          <ThreadRow thread={thread} />
        </div>
      ))}
      {threads.length === 0 && <div className="text-center py-8 text-gray-500">No threads found in this subforum</div>}
    </div>
  );
}

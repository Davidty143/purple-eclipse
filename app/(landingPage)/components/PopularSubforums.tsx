'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface ThreadData {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  author: {
    account_username: string | null;
    account_email: string | null;
    avatar_url?: string | null;
  };
  comments: { count: number }[];
}

interface SubforumData {
  subforum_id: number;
  subforum_name: string | null;
  subforum_description: string | null;
  threads: ThreadData[];
}

// Define a more specific type for the Supabase response
interface DatabaseThread {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  comments: { count: number }[];
  author: {
    account_username: string | null;
    account_email: string | null;
    avatar_url: string | null;
  } | null;
}

export function ThreadRow({ thread }: { thread: ThreadData }) {
  // Use the avatar_url if available, otherwise fallback to the vercel.sh avatar
  // Adding null check to ensure we don't access properties of undefined
  const avatarUrl = thread.author?.avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'user'}`;

  return (
    <Link href={`/thread/${thread.thread_id}`}>
      <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md transition-colors cursor-pointer">
        {/* Avatar on the leftmost */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-xs">{thread.author?.account_username ? thread.author.account_username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Thread
            </Badge>
            <span className="text-sm font-semibold truncate">{thread.thread_title}</span>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Posted by {thread.author?.account_username || 'Anonymous'} • {format(new Date(thread.thread_created), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SubforumSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="px-5 py-4 bg-gray-100">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-2 mt-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}

export function SubforumBlock({ subforum }: { subforum: SubforumData }) {
  return (
    <Card className="w-full">
      <CardHeader className="px-5 py-4 bg-gray-100">
        <CardTitle className="text-md">{subforum.subforum_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-4">{subforum.threads.length > 0 ? subforum.threads.slice(0, 5).map((thread) => <ThreadRow key={thread.thread_id} thread={thread} />) : <div className="py-3 text-center text-muted-foreground">No threads yet</div>}</CardContent>
    </Card>
  );
}

export function PopularSubforumsGrid() {
  const [subforums, setSubforums] = useState<SubforumData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubforums() {
      try {
        const supabase = createClient();

        // First get active subforums
        const { data: subforumData, error: subforumError } = await supabase
          .from('Subforum')
          .select(
            `
            subforum_id,
            subforum_name,
            subforum_description
          `
          )
          .eq('subforum_deleted', false)
          .limit(5);

        if (subforumError) {
          console.error('Error fetching subforums:', subforumError);
          throw new Error(`Subforum fetch error: ${subforumError.message}`);
        }

        if (!subforumData || subforumData.length === 0) {
          setSubforums([]);
          setLoading(false);
          return;
        }

        // For each subforum, fetch threads with author data directly
        const subforumsWithThreads = await Promise.all(
          subforumData.map(async (subforum) => {
            try {
              // 1. Get threads for this subforum with author data directly
              const { data: threadsData, error: threadsError } = await supabase
                .from('Thread')
                .select(
                  `
                  thread_id,
                  thread_title,
                  thread_created,
                  comments:Comment(count),
                  author:author_id(
                    account_username,
                    account_email
                  )
                `
                )
                .eq('subforum_id', subforum.subforum_id)
                .eq('thread_deleted', false)
                .order('thread_created', { ascending: false })
                .limit(5);

              if (threadsError) {
                console.error(`Error fetching threads for subforum ${subforum.subforum_id}:`, threadsError.message, threadsError.details, threadsError.hint);
                // If there's an error, return the subforum with empty threads
                return {
                  subforum_id: subforum.subforum_id,
                  subforum_name: subforum.subforum_name,
                  subforum_description: subforum.subforum_description,
                  threads: []
                };
              }

              // If no threads for this subforum, return early
              if (!threadsData || threadsData.length === 0) {
                return {
                  subforum_id: subforum.subforum_id,
                  subforum_name: subforum.subforum_name,
                  subforum_description: subforum.subforum_description,
                  threads: []
                };
              }

              // Transform data to match our interface
              const threads: ThreadData[] = threadsData.map((thread: any) => ({
                thread_id: thread.thread_id,
                thread_title: thread.thread_title,
                thread_created: thread.thread_created,
                author: {
                  account_username: thread.author?.account_username || null,
                  account_email: thread.author?.account_email || null,
                  avatar_url: thread.author?.avatar_url || null
                },
                comments: thread.comments || []
              }));

              return {
                subforum_id: subforum.subforum_id,
                subforum_name: subforum.subforum_name,
                subforum_description: subforum.subforum_description,
                threads
              };
            } catch (err) {
              console.error(`Error processing subforum ${subforum.subforum_id}:`, err);
              // Return subforum with empty threads rather than failing completely
              return {
                subforum_id: subforum.subforum_id,
                subforum_name: subforum.subforum_name,
                subforum_description: subforum.subforum_description,
                threads: []
              };
            }
          })
        );

        setSubforums(subforumsWithThreads);
      } catch (err: any) {
        console.error('Error fetching subforums:', err);
        setError(err?.message || 'Failed to load subforums. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSubforums();
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 text-red-800 rounded-md">Error: {error}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <SubforumSkeleton key={i} />
          ))}
      </div>
    );
  }

  if (subforums.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="w-full p-8 text-center">
          <p className="text-muted-foreground">No active subforums found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subforums.map((subforum) => (
        <SubforumBlock key={subforum.subforum_id} subforum={subforum} />
      ))}
    </div>
  );
}

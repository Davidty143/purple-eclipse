'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { createCachedFetch } from '@/lib/use-cached-fetch';
import { SubforumData, ThreadData } from '@/types/forum';

export function ThreadRow({ thread }: { thread: ThreadData }) {
  // Use the avatar_url if available, otherwise fallback to the vercel.sh avatar
  // Adding null check to ensure we don't access properties of undefined
  const avatarUrl = thread.author?.account_avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'user'}`;

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
    <Card className="w-full border border-gray-300">
      <CardHeader className="px-5 py-4 bg-gray-100 border-b border-gray-300  rounded-t-lg">
        <CardTitle className="font-medium text-md">{subforum.subforum_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-4">{subforum.threads.length > 0 ? subforum.threads.slice(0, 5).map((thread) => <ThreadRow key={thread.thread_id} thread={thread} />) : <div className="py-3 text-center text-muted-foreground">No threads yet</div>}</CardContent>
    </Card>
  );
}

// Create a suspense-ready data fetcher
const fetchSubforums = async () => {
  try {
    // Fetch data from an API endpoint instead of direct Supabase access
    const response = await fetch('/api/subforums/popular', {
      cache: 'no-store',
      next: { revalidate: 120 } // 2 minutes cache, matching our TTL
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subforums:', error);
    return [];
  }
};

// Create a cached fetcher with a 2-minute TTL
const getSubforumsData = createCachedFetch<SubforumData[]>(
  'popular-subforums',
  fetchSubforums,
  { ttl: 2 * 60 * 1000 } // 2 minutes cache
);

export function PopularSubforumsGrid() {
  // Replace the React.use() with useState and useEffect for client-side rendering
  const [subforums, setSubforums] = useState<SubforumData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data client-side to avoid hydration mismatch
    getSubforumsData()
      .then((data) => {
        setSubforums(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching subforums data:', error);
        setLoading(false);
      });
  }, []);

  // Show loading state during initial render
  if (loading) {
    return (
      <div className="space-y-6">
        <SubforumSkeleton />
        <SubforumSkeleton />
      </div>
    );
  }

  // If there was an error, it would be thrown and caught by the nearest error boundary
  if (!subforums || subforums.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">No active subforums found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {subforums.map((subforum: SubforumData) => (
        <SubforumBlock key={subforum.subforum_id} subforum={subforum} />
      ))}
    </div>
  );
}

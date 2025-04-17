import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClientForServer } from '@/utils/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import Link from 'next/link';

type SearchPageProps = {
  searchParams: { q?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q;

  // If no query, redirect to home
  if (!query) {
    redirect('/');
  }

  return (
    <main className="flex flex-col items-center justify-between p-4 min-h-screen">
      <div className="w-full max-w-[1250px] xl:w-[80%]">
        <h1 className="text-2xl font-bold mb-6">Search Results for: {query}</h1>

        <Suspense fallback={<div className="text-center py-10">Loading results...</div>}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </main>
  );
}

// Define types for the thread data structure
type Thread = {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_created: string;
  thread_modified: string;
  subforum_id: number;
  author_id: string;
  comments: { count: number }[];
  author: {
    account_username: string | null;
    account_email: string | null;
  };
  subforum: {
    subforum_name: string;
    subforum_id: number;
    forum_id: number;
    forum: {
      forum_name: string;
    };
  };
};

async function SearchResults({ query }: { query: string }) {
  // Get client
  const supabase = await createClientForServer();

  // Search threads that match the query in title only
  const { data: threads, error } = await supabase
    .from('Thread')
    .select(
      `
      thread_id,
      thread_title,
      thread_content,
      thread_created,
      thread_modified,
      subforum_id,
      author_id,
      author:Account!author_id(
        account_username,
        account_email
      ),
      comments:Comment(count),
      subforum:Subforum(
        subforum_name,
        subforum_id,
        forum_id,
        forum:Forum(
          forum_name
        )
      )
    `
    )
    .ilike('thread_title', `%${query}%`) // Only search in the title
    .eq('thread_deleted', false)
    .order('thread_created', { ascending: false })
    .limit(20);

  if (error) {
    return <div className="text-red-500">Error loading search results: {error.message}</div>;
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600">No results found for "{query}"</p>
        <p className="mt-2 text-sm">Try different keywords or check your spelling.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 border rounded-lg overflow-hidden">
      {threads.map((thread: any) => (
        <Link key={thread.thread_id} href={`/thread/${thread.thread_id}`}>
          <div className="thread-row py-3.5 px-6 flex flex-col hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
            <div className="flex items-center space-x-4 justify-between">
              {/* Author Profile */}
              <div className="flex flex-row gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`} />
                  <AvatarFallback>{(thread.author?.account_username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* Thread Details */}
                <div className="flex items-center">
                  <div>
                    <div className="flex justify-start items-center gap-2">
                      <span className="text-xs font-semibold bg-gray-200 px-4 py-0.5 rounded-sm">{thread.subforum?.forum?.forum_name || 'Discussion'}</span>
                      <h3 className="text-md font-semibold">{thread.thread_title}</h3>
                    </div>
                    <div className="text-xs text-semibold text-gray-500">
                      <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
                      {' - '}
                      <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                      {' - '}
                      <span>{thread.subforum?.subforum_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Replies Count */}
              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex flex-col items-start">
                  <span className="px-2 text-xs">Replies: {thread.comments[0]?.count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

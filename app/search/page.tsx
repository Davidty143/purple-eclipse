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
    avatar_url: string | null;
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

  // Search threads that match the query in title or content
  const { data: contentThreads, error: contentError } = await supabase
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
    .or(`thread_title.ilike.%${query}%,thread_content.ilike.%${query}%`) // Search in title and content
    .eq('thread_deleted', false)
    .order('thread_created', { ascending: false })
    .limit(20);

  // Search threads by username
  const { data: usernameThreads, error: usernameError } = await supabase
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
    .eq('thread_deleted', false)
    .filter('author.account_username', 'ilike', `%${query}%`) // Search by username
    .order('thread_created', { ascending: false })
    .limit(20);

  if (contentError && usernameError) {
    return <div className="text-red-500">Error loading search results: {contentError.message || usernameError.message}</div>;
  }

  // Combine results and remove duplicates
  const allThreads = [...(contentThreads || []), ...(usernameThreads || [])];
  const uniqueThreadIds = new Set();
  const threads = allThreads.filter((thread) => {
    if (uniqueThreadIds.has(thread.thread_id)) {
      return false;
    }
    uniqueThreadIds.add(thread.thread_id);
    return true;
  });

  if (!threads || threads.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600">No results found for "{query}"</p>
        <p className="mt-2 text-sm">Try different keywords or check your spelling.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Found {threads.length} results</p>
      <div className="space-y-4">
        {threads.map((thread: any) => (
          <div key={thread.thread_id} className="border rounded-lg overflow-hidden bg-white hover:bg-gray-50 transition-colors">
            <Link href={`/thread/${thread.thread_id}`} className="block p-5">
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={`https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`} />
                  <AvatarFallback>{(thread.author?.account_username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* Thread Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-gray-200 px-3 py-0.5 rounded-full">{thread.subforum?.forum?.forum_name || 'Discussion'}</span>
                    <span className="text-xs text-gray-500">in {thread.subforum?.subforum_name}</span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{thread.thread_title}</h3>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-700 line-clamp-2 mb-2" dangerouslySetInnerHTML={{ __html: thread.thread_content }}></p>

                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                    <span className="mx-2">•</span>
                    <span>{thread.comments[0]?.count || 0} replies</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

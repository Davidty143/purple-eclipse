import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClientForServer } from '@/app/utils/supabase/server';
import { format } from 'date-fns';
import Link from 'next/link';

// Define the page props type
type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>; // Search params are now a Promise
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams Promise
  const { q, type } = await searchParams;
  const query = q || ''; // Default to an empty string if no query
  const searchType = type || 'content'; // Default to 'content' if no type is provided

  // If no query, redirect to home
  if (!query) {
    redirect('/');
  }

  return (
    <main className="flex flex-col items-center justify-between p-4 min-h-screen">
      <div className="w-full max-w-[1250px] xl:w-[80%]">
        <h1 className="text-2xl font-bold mb-2">Search Results for: {query}</h1>

        {/* Search Type Selector */}
        <div className="flex mb-6 gap-2">
          <Link href={`/search?q=${encodeURIComponent(query)}&type=content`} className={`px-4 py-1 rounded-md text-sm ${searchType === 'content' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            Content
          </Link>
          <Link href={`/search?q=${encodeURIComponent(query)}&type=username`} className={`px-4 py-1 rounded-md text-sm ${searchType === 'username' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            By Username
          </Link>
          <Link href={`/search?q=${encodeURIComponent(query)}&type=all`} className={`px-4 py-1 rounded-md text-sm ${searchType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
            All
          </Link>
        </div>

        <Suspense fallback={<div className="text-center py-10">Loading results...</div>}>
          <SearchResults query={query} searchType={searchType} />
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

async function SearchResults({ query, searchType }: { query: string; searchType: string }) {
  const supabase = await createClientForServer();

  if (!query || query.trim().length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600">Please enter a search term.</p>
      </div>
    );
  }

  const searchTerm = query.trim();
  let threads: any[] = [];
  let error = null;

  if (searchType === 'content' || searchType === 'all') {
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
      .eq('thread_deleted', false)
      .or(`thread_title.ilike.%${searchTerm}%,thread_content.ilike.%${searchTerm}%`)
      .order('thread_created', { ascending: false })
      .limit(20);

    if (contentError) {
      error = contentError;
    } else if (contentThreads) {
      threads = [...contentThreads];
    }
  }

  if (searchType === 'username' || searchType === 'all') {
    const { data: matchingAccounts, error: accountError } = await supabase.from('Account').select('account_id').ilike('account_username', `%${searchTerm}%`);

    if (accountError) {
      if (!error) error = accountError;
    } else if (matchingAccounts && matchingAccounts.length > 0) {
      const authorIds = matchingAccounts.map((account) => account.account_id);

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
        .in('author_id', authorIds)
        .order('thread_created', { ascending: false })
        .limit(20);

      if (usernameError) {
        if (!error) error = usernameError;
      } else if (usernameThreads) {
        threads = [...threads, ...usernameThreads];
      }
    }
  }

  if (error) {
    return <div className="text-red-500">Error loading search results: {error.message}</div>;
  }

  if (searchType === 'all') {
    const uniqueThreadIds = new Set();
    threads = threads.filter((thread) => {
      if (uniqueThreadIds.has(thread.thread_id)) {
        return false;
      }
      uniqueThreadIds.add(thread.thread_id);
      return true;
    });
  }

  if (!threads || threads.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-gray-600"> {`No results found for "${query}"`}</p>
        <p className="mt-2 text-sm">{`Try different keywords or check your spelling.`}</p>
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
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={`https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`} />
                  <AvatarFallback>{(thread.author?.account_username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-gray-200 px-3 py-0.5 rounded-full">{thread.subforum?.forum?.forum_name || 'Discussion'}</span>
                    <span className="text-xs text-gray-500">in {thread.subforum?.subforum_name}</span>
                  </div>

                  <h3 className="text-lg font-semibold mb-1">{thread.thread_title}</h3>

                  <p className="text-sm text-gray-700 line-clamp-2 mb-2" dangerouslySetInnerHTML={{ __html: thread.thread_content }}></p>

                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {thread.comments[0]?.count || 0} replies
                    </span>
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

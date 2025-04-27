import { createClientForServer } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';

interface PageProps {
  params: {
    category: string;
    threadId: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { category, threadId } = params;

  // Validate threadId is a number
  if (!threadId || isNaN(parseInt(threadId))) {
    return notFound();
  }

  try {
    const supabase = await createClientForServer();

    // Fetch thread data to verify it exists and belongs to the specified category
    const { data: thread, error: threadError } = await supabase.from('Thread').select('thread_id, subforum_id').eq('thread_id', parseInt(threadId)).eq('thread_deleted', false).single();

    if (threadError) {
      // Check for the specific column error
      if (threadError.message && threadError.message.includes('avatar_url does not exist')) {
        console.error('Column error detected. Redirecting directly to thread page.');
        return redirect(`/thread/${threadId}`);
      }

      console.error('Error fetching thread:', threadError);
      return notFound();
    }

    if (!thread) {
      console.error('Thread not found');
      return notFound();
    }

    // Now fetch the subforum data separately if needed
    let subforumName = null;
    if (thread.subforum_id) {
      const { data: subforum } = await supabase.from('Subforum').select('subforum_name').eq('subforum_id', thread.subforum_id).single();

      if (subforum) {
        subforumName = subforum.subforum_name;
      }
    }

    // Normalize the category name from the URL for comparison
    const normalizedUrlCategory = category.toLowerCase();
    const normalizedThreadCategory = subforumName?.toLowerCase();

    // If the categories don't match, redirect to the correct URL
    if (normalizedUrlCategory !== normalizedThreadCategory) {
      if (subforumName) {
        return redirect(`/category/${subforumName.toLowerCase()}/thread/${threadId}`);
      } else {
        return redirect(`/thread/${threadId}`);
      }
    }

    // Redirect to the standard thread page - we're just using this route for the URL pattern
    return redirect(`/thread/${threadId}`);
  } catch (error) {
    console.error('Error in category thread route:', error);
    return notFound();
  }
}

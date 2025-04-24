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
    const { data: thread, error: threadError } = await supabase
      .from('Thread')
      .select(
        `
        thread_id,
        subforum:subforum_id (
          subforum_name
        )
      `
      )
      .eq('thread_id', parseInt(threadId))
      .eq('thread_deleted', false)
      .single();

    if (threadError || !thread) {
      console.error('Error fetching thread:', threadError);
      return notFound();
    }

    // Normalize the category name from the URL for comparison
    const normalizedUrlCategory = category.toLowerCase();
    const normalizedThreadCategory = thread.subforum?.subforum_name?.toLowerCase();

    // If the categories don't match, redirect to the correct URL
    if (normalizedUrlCategory !== normalizedThreadCategory) {
      if (thread.subforum?.subforum_name) {
        return redirect(`/category/${thread.subforum.subforum_name.toLowerCase()}/thread/${threadId}`);
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

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

  if (!threadId || isNaN(parseInt(threadId))) {
    return notFound();
  }

  try {
    const supabase = await createClientForServer();

    const { data: thread, error: threadError } = await supabase.from('Thread').select('thread_id, subforum_id').eq('thread_id', parseInt(threadId)).eq('thread_deleted', false).single();

    if (threadError) {
      if (threadError.message?.includes('avatar_url does not exist')) {
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

    let subforumName: string | null = null;
    if (thread.subforum_id) {
      const { data: subforum } = await supabase.from('Subforum').select('subforum_name').eq('subforum_id', thread.subforum_id).single();

      if (subforum) {
        subforumName = subforum.subforum_name;
      }
    }

    const normalizedUrlCategory = category.toLowerCase();
    const normalizedThreadCategory = subforumName?.toLowerCase();

    if (normalizedUrlCategory !== normalizedThreadCategory) {
      if (subforumName) {
        return redirect(`/category/${subforumName.toLowerCase()}/thread/${threadId}`);
      } else {
        return redirect(`/thread/${threadId}`);
      }
    }

    return redirect(`/thread/${threadId}`);
  } catch (error) {
    console.error('Error in category thread route:', error);
    return notFound();
  }
}

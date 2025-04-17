import { createClientForServer } from '@/utils/supabase/server';
import ThreadView from './components/ThreadView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    threadId: string;
  };
}

export default async function Page({ params }: PageProps) {
  // Get threadId from params and ensure it's a valid value
  const { threadId } = params;

  // Validate threadId is a number
  if (!threadId || isNaN(parseInt(threadId))) {
    return notFound();
  }

  try {
    const supabase = await createClientForServer();

    // Fetch thread data with all related information
    const { data: thread, error: threadError } = await supabase
      .from('Thread')
      .select(
        `
        *,
        author:author_id (
          account_username,
          account_email
        ),
        subforum:subforum_id (
          subforum_name,
          forum:forum_id (
            forum_name
          )
        ),
        comments:Comment (
          *,
          author:author_id (
            account_username,
            account_email
          )
        ),
        images:thread_image (
          thread_image_id,
          image_url,
          storage_path,
          created_at
        )
      `
      )
      .eq('thread_id', parseInt(threadId))
      .eq('thread_deleted', false)
      .order('comment_created', { foreignTable: 'Comment', ascending: true })
      .single();

    if (threadError || !thread) {
      console.error('Error fetching thread:', threadError);
      return notFound();
    }

    return <ThreadView thread={thread} />;
  } catch (error) {
    console.error('Error loading thread page:', error);
    return notFound();
  }
}

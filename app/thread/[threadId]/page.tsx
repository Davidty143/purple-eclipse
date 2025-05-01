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
  const threadId = params?.threadId;

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
          account_email,
          account_avatar_url
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
            account_email,
            account_avatar_url
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

    // Process the comments to organize replies
    if (thread.comments) {
      const commentMap = new Map();
      const topLevelComments: any[] = [];

      // First pass: map all comments by their ID
      thread.comments.forEach((comment: any) => {
        commentMap.set(comment.comment_id, { ...comment, replies: [] });
      });

      // Second pass: organize into parent-child relationships
      thread.comments.forEach((comment: any) => {
        if (comment.parent_comment_id && commentMap.has(comment.parent_comment_id)) {
          const parentComment = commentMap.get(comment.parent_comment_id);

          // Check if the parent itself is a reply (has a parent)
          if (parentComment.parent_comment_id && commentMap.has(parentComment.parent_comment_id)) {
            // This is a reply to a reply - find the top-level parent and add as a nested reply
            const topLevelParent = commentMap.get(parentComment.parent_comment_id);

            // Ensure the direct reply has a replies array
            if (!parentComment.replies) {
              parentComment.replies = [];
            }

            // Add this as a nested reply to its direct parent
            parentComment.replies.push(commentMap.get(comment.comment_id));
          } else {
            // This is a direct reply to a top-level comment
            parentComment.replies.push(commentMap.get(comment.comment_id));
          }
        } else {
          // This is a top-level comment
          topLevelComments.push(commentMap.get(comment.comment_id));
        }
      });

      // Replace the flat comments array with our organized structure
      thread.comments = topLevelComments;
    }

    return <ThreadView thread={thread} />;
  } catch (error) {
    console.error('Error loading thread page:', error);
    return notFound();
  }
}

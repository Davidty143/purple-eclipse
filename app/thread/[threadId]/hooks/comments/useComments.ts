'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { Thread, Comment } from '../../components/interfaces';
import { CommentState, CommentHandlers } from './types';
import { generateUniqueId, findParentComment, removeOptimisticReply, createOptimisticComment } from './utils';
import { createCommentNotification } from './notifications';
import { ensureAccountExists } from './account';

const insertComment = async (supabase: any, commentData: any) => {
  const { data, error } = await supabase
    .from('Comment')
    .insert(commentData)
    .select(
      `
      *,
      author:author_id (
        account_username,
        account_email,
        account_avatar_url
      )
    `
    )
    .single();

  if (error) throw error;
  if (!data) throw new Error('No data returned from comment insertion');
  return data;
};

const notifyAuthor = async (supabase: any, commentId: number, threadId: number, userId: string, type: 'COMMENT' | 'REPLY', parentCommentId?: number) => {
  console.log('Starting notifyAuthor:', { commentId, threadId, userId, type, parentCommentId });

  try {
    let recipientId: string | null = null;

    if (type === 'COMMENT') {
      console.log('Fetching thread author for thread:', threadId);
      // For new comments, notify the thread author
      const { data: threadData, error: threadError } = await supabase
        .from('Thread')
        .select('author_id, thread_title') // Added thread_title for better logging
        .eq('thread_id', threadId)
        .single();

      console.log('Thread query result:', { threadData, threadError });

      if (threadError) {
        console.error('Error fetching thread author:', threadError);
        return;
      }

      if (!threadData?.author_id) {
        console.error('Thread author not found for thread:', threadId);
        return;
      }

      recipientId = threadData.author_id;
      console.log('Found thread author:', {
        threadId,
        threadTitle: threadData.thread_title,
        authorId: recipientId
      });
    } else if (type === 'REPLY' && parentCommentId) {
      // For replies, notify the parent comment author
      const { data: parentCommentData, error: parentError } = await supabase.from('Comment').select('author_id').eq('comment_id', parentCommentId).single();

      if (parentError) {
        console.error('Error fetching parent comment author:', parentError);
        return;
      }

      if (!parentCommentData?.author_id) {
        console.error('Parent comment author not found for comment:', parentCommentId);
        return;
      }

      recipientId = parentCommentData.author_id;
    }

    // Don't create notification if:
    // 1. No recipient found
    // 2. Recipient is the same as the sender (self-notification)
    // 3. Missing required data
    if (!recipientId || recipientId === userId) {
      console.log('Skipping notification:', {
        reason: !recipientId ? 'No recipient found' : 'Self notification',
        recipientId,
        userId,
        type
      });
      return;
    }

    console.log('Attempting to create notification:', {
      type,
      recipientId,
      senderId: userId,
      threadId,
      commentId,
      parentCommentId
    });

    try {
      await createCommentNotification(recipientId, userId, threadId, commentId, type);
      console.log('Notification creation completed successfully');
    } catch (notificationError) {
      console.error('Error in createCommentNotification:', notificationError);
    }
  } catch (error) {
    console.error('Error in notifyAuthor:', error);
  }
};

export function useComments(initialThread: Thread, user: any | null): CommentState & CommentHandlers {
  const [thread, setThread] = useState(initialThread);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const isSubmittingRef = useRef(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting || isSubmittingRef.current) return;

    console.log('Starting comment submission for user:', user.id);

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const commentContent = newComment.trim();

    const optimisticComment = createOptimisticComment(commentContent, user);
    setThread((prev) => ({
      ...prev,
      comments: [...prev.comments, optimisticComment]
    }));
    setNewComment('');

    try {
      console.log('Ensuring account exists for user:', user.id);
      await ensureAccountExists(user);

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      console.log('Created Supabase client');

      console.log('Inserting comment:', {
        threadId: thread.thread_id,
        userId: user.id,
        contentLength: commentContent.length
      });

      const data = await insertComment(supabase, {
        comment_content: commentContent,
        thread_id: thread.thread_id,
        author_id: user.id,
        comment_deleted: false,
        comment_created: new Date().toISOString(),
        comment_modified: new Date().toISOString()
      });

      console.log('Comment inserted successfully:', {
        commentId: data.comment_id,
        threadId: thread.thread_id
      });

      // Pass undefined for parentCommentId since this is a new comment
      console.log('Calling notifyAuthor for new comment');
      await notifyAuthor(supabase, data.comment_id, thread.thread_id, user.id, 'COMMENT');

      setThread((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => (c.comment_id === optimisticComment.comment_id ? data : c))
      }));

      toast.success('Comment posted successfully');
    } catch (error: any) {
      console.error('Error in handleCommentSubmit:', error);
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      setThread((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.comment_id !== optimisticComment.comment_id)
      }));
      toast.error(`Failed to post comment: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleReplySubmit = async (parentCommentId: number, content?: string) => {
    if (!user || isSubmitting || isSubmittingRef.current) return;

    const commentContent = content?.trim() || replyContent.trim();
    if (!commentContent) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const optimisticReply = createOptimisticComment(commentContent, user, parentCommentId);
    setThread((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) => {
        if (comment.comment_id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), optimisticReply]
          };
        }
        return comment;
      })
    }));

    if (!content) {
      setReplyContent('');
      setReplyingTo(null);
    }

    try {
      await ensureAccountExists(user);
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const data = await insertComment(supabase, {
        comment_content: commentContent,
        thread_id: thread.thread_id,
        author_id: user.id,
        comment_deleted: false,
        comment_created: new Date().toISOString(),
        comment_modified: new Date().toISOString(),
        parent_comment_id: parentCommentId
      });

      await notifyAuthor(supabase, data.comment_id, thread.thread_id, user.id, 'REPLY', parentCommentId);

      setThread((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) => {
          if (comment.comment_id === parentCommentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => (reply.comment_id === optimisticReply.comment_id ? data : reply))
            };
          }
          return comment;
        })
      }));

      toast.success('Reply posted successfully');
    } catch (error: any) {
      console.error('Error posting reply:', error);
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      setThread((prev) => ({
        ...prev,
        comments: removeOptimisticReply(prev.comments, optimisticReply.comment_id)
      }));
      toast.error(`Failed to post reply: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleNestedReplySubmit = async (replyId: number, content: string) => {
    if (!user || !content.trim() || isSubmitting || isSubmittingRef.current) return false;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const optimisticReply = createOptimisticComment(content, user, replyId);
    setThread((prev) => {
      const { parentComment, grandParentComment } = findParentComment(prev.comments, replyId);
      if (!parentComment) return prev;

      return {
        ...prev,
        comments: prev.comments.map((comment) => {
          if (grandParentComment && comment.comment_id === grandParentComment.comment_id) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) => (reply.comment_id === replyId ? { ...reply, replies: [...(reply.replies || []), optimisticReply] } : reply))
            };
          }
          if (!grandParentComment && comment.comment_id === replyId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), optimisticReply]
            };
          }
          return comment;
        })
      };
    });

    try {
      await ensureAccountExists(user);
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const data = await insertComment(supabase, {
        comment_content: content.trim(),
        thread_id: thread.thread_id,
        author_id: user.id,
        comment_deleted: false,
        comment_created: new Date().toISOString(),
        comment_modified: new Date().toISOString(),
        parent_comment_id: replyId
      });

      await notifyAuthor(supabase, data.comment_id, thread.thread_id, user.id, 'REPLY', replyId);

      setThread((prev) => {
        const { parentComment, grandParentComment } = findParentComment(prev.comments, replyId);
        if (!parentComment) return prev;

        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (grandParentComment && comment.comment_id === grandParentComment.comment_id) {
              return {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.comment_id === replyId
                    ? {
                        ...reply,
                        replies: reply.replies?.map((r) => (r.comment_id === optimisticReply.comment_id ? data : r)) || [data]
                      }
                    : reply
                )
              };
            }
            if (!grandParentComment && comment.comment_id === replyId) {
              return {
                ...comment,
                replies: comment.replies?.map((r) => (r.comment_id === optimisticReply.comment_id ? data : r)) || [data]
              };
            }
            return comment;
          })
        };
      });

      toast.success('Reply posted successfully');
      return true;
    } catch (error: any) {
      console.error('Error posting nested reply:', error);

      setThread((prev) => {
        const { parentComment, grandParentComment } = findParentComment(prev.comments, replyId);
        if (!parentComment) return prev;

        return {
          ...prev,
          comments: prev.comments.map((comment) => {
            if (grandParentComment && comment.comment_id === grandParentComment.comment_id) {
              return {
                ...comment,
                replies: comment.replies?.map((reply) =>
                  reply.comment_id === replyId
                    ? {
                        ...reply,
                        replies: reply.replies?.filter((r) => r.comment_id !== optimisticReply.comment_id) || []
                      }
                    : reply
                )
              };
            }
            if (!grandParentComment && comment.comment_id === replyId) {
              return {
                ...comment,
                replies: comment.replies?.filter((r) => r.comment_id !== optimisticReply.comment_id) || []
              };
            }
            return comment;
          })
        };
      });

      toast.error(`Failed to post reply: ${error.message || 'Please try again'}`);
      return false;
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return {
    thread,
    setThread,
    newComment,
    setNewComment,
    isSubmitting,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    handleCommentSubmit,
    handleReplySubmit,
    handleNestedReplySubmit
  };
}

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
  try {
    let recipientId: string | null = null;

    if (type === 'COMMENT') {
      const { data: threadData, error: threadError } = await supabase.from('Thread').select('author_id, thread_title').eq('thread_id', threadId).single();

      if (threadError) {
        return;
      }

      if (!threadData?.author_id) {
        return;
      }

      recipientId = threadData.author_id;
    } else if (type === 'REPLY' && parentCommentId) {
      const { data: parentCommentData, error: parentError } = await supabase.from('Comment').select('author_id').eq('comment_id', parentCommentId).single();

      if (parentError) {
        return;
      }

      if (!parentCommentData?.author_id) {
        return;
      }

      recipientId = parentCommentData.author_id;
    }

    if (!recipientId || recipientId === userId) {
      return;
    }

    try {
      await createCommentNotification(recipientId, userId, threadId, commentId, type);
    } catch (notificationError) {}
  } catch (error) {}
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
      await ensureAccountExists(user);

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      const data = await insertComment(supabase, {
        comment_content: commentContent,
        thread_id: thread.thread_id,
        author_id: user.id,
        comment_deleted: false,
        comment_created: new Date().toISOString(),
        comment_modified: new Date().toISOString()
      });

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

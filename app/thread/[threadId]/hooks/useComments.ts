'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { Thread, Comment } from '../components/interfaces';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function useComments(initialThread: Thread, user: any | null) {
  const [thread, setThread] = useState(initialThread);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const isSubmittingRef = useRef(false);

  // Function to generate unique comment IDs for optimistic updates
  const generateUniqueId = (prefix: number = 1) => {
    return -Math.floor(Date.now() * Math.random() * 10000 * prefix);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting || isSubmittingRef.current) return;

    // Prevent duplicate submissions
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const commentContent = newComment.trim();

    // Create optimistic comment
    const optimisticComment: Comment = {
      comment_id: generateUniqueId(),
      comment_content: commentContent,
      comment_created: new Date().toISOString(),
      comment_deleted: false,
      author: {
        account_username: user.user_metadata?.username || 'Anonymous',
        account_email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url
      }
    };

    // Optimistically update UI
    setThread((prev) => ({
      ...prev,
      comments: [...prev.comments, optimisticComment]
    }));
    setNewComment('');

    try {
      // Validate user ID is available
      if (!user.id) {
        throw new Error('User ID is missing');
      }

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // First check if the account exists in the Account table
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      // If the account doesn't exist, create one
      if (accountError || !accountData) {
        console.log('Account not found, creating new account');
        // Get avatar URL from Google profile
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false,
          avatar_url: avatarUrl // Use avatar_url to match the database column name
        });

        if (createAccountError) {
          console.error('Error creating account:', createAccountError);
          throw new Error(`Account creation failed: ${createAccountError.message}`);
        }
      }

      // Now insert the comment
      const { data, error } = await supabase
        .from('Comment')
        .insert({
          comment_content: commentContent,
          thread_id: thread.thread_id,
          author_id: user.id,
          comment_deleted: false,
          comment_created: new Date().toISOString(),
          comment_modified: new Date().toISOString()
        })
        .select(
          `
          *,
          author:author_id (
            account_username,
            account_email,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error('Comment insert error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from comment insertion');
      }

      // Update with real comment data
      setThread((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => (c.comment_id === optimisticComment.comment_id ? data : c))
      }));

      toast.success('Comment posted successfully');
    } catch (error: any) {
      console.error('Error posting comment:', error);
      // Log more details about the error
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      // Revert optimistic update
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

    // Use passed content for nested replies or replyContent for direct replies
    const commentContent = content?.trim() || replyContent.trim();

    if (!commentContent) return;

    // Prevent duplicate submissions
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Create optimistic reply with a unique key using generateUniqueId
    const optimisticReply: Comment = {
      comment_id: generateUniqueId(2), // Different multiplier for replies
      comment_content: commentContent,
      comment_created: new Date().toISOString(),
      comment_deleted: false,
      parent_comment_id: parentCommentId,
      author: {
        account_username: user.user_metadata?.username || 'Anonymous',
        account_email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url
      }
    };

    try {
      // Use createBrowserClient for consistency with the rest of the application
      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // Find the exact parent comment (could be a reply itself)
      const findComment = (comments: Comment[], targetId: number): Comment | null => {
        for (const comment of comments) {
          if (comment.comment_id === targetId) {
            return comment;
          }
          if (comment.replies && comment.replies.length > 0) {
            const found = findComment(comment.replies, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      // Optimistically update UI
      setThread((prev) => {
        const updatedComments = [...prev.comments];

        // Find if we're replying to a comment or a reply
        const parentComment = findComment(updatedComments, parentCommentId);

        if (parentComment) {
          // If parent has no replies array, create one
          if (!parentComment.replies) {
            parentComment.replies = [];
          }

          // Check if this is a duplicate reply (same content to same parent within 5 seconds)
          const isDuplicate = parentComment.replies.some((reply) => reply.comment_content === commentContent && reply.author.account_email === user.email && Math.abs(new Date(reply.comment_created).getTime() - new Date().getTime()) < 5000);

          if (!isDuplicate) {
            // Add the new reply to the parent's replies
            parentComment.replies.push(optimisticReply);
          }
        } else {
          // If parent not found, add as a regular comment
          updatedComments.push(optimisticReply);
        }

        return {
          ...prev,
          comments: updatedComments
        };
      });

      // Only clear replyContent if we're using it (not using passed content parameter)
      if (!content) {
        setReplyContent('');
        setReplyingTo(null);
      }

      // First check if the account exists in the Account table
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      // If the account doesn't exist, create one
      if (accountError || !accountData) {
        console.log('Account not found, creating new account');
        // Get avatar URL from Google profile
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false,
          avatar_url: avatarUrl // Use avatar_url to match the database column name
        });

        if (createAccountError) {
          console.error('Error creating account:', createAccountError);
          throw new Error(`Account creation failed: ${createAccountError.message}`);
        }
      }

      // Now insert the reply comment
      const { data, error } = await supabase
        .from('Comment')
        .insert({
          comment_content: commentContent,
          thread_id: thread.thread_id,
          author_id: user.id,
          comment_deleted: false,
          comment_created: new Date().toISOString(),
          comment_modified: new Date().toISOString(),
          parent_comment_id: parentCommentId
        })
        .select(
          `
          *,
          author:author_id (
            account_username,
            account_email,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error('Reply insert error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from reply insertion');
      }

      // Update with real reply data by recursively searching and updating the comment tree
      const updateReplyInComments = (comments: Comment[], optimisticId: number, realData: Comment): Comment[] => {
        return comments.map((comment) => {
          // Check if this comment is the parent of our optimistic reply
          if (comment.replies) {
            const replyIndex = comment.replies.findIndex((r) => r.comment_id === optimisticId);
            if (replyIndex !== -1) {
              // Replace the optimistic reply with real data
              const updatedReplies = [...comment.replies];
              updatedReplies[replyIndex] = realData;
              return { ...comment, replies: updatedReplies };
            }

            // Check if the optimistic reply is in nested replies
            return {
              ...comment,
              replies: updateReplyInComments(comment.replies, optimisticId, realData)
            };
          }
          return comment;
        });
      };

      // Update the thread with real data
      setThread((prev) => ({
        ...prev,
        comments: updateReplyInComments(prev.comments, optimisticReply.comment_id, data)
      }));

      toast.success('Reply posted successfully');
    } catch (error: any) {
      console.error('Error posting reply:', error);
      // Log more details about the error
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      // Revert optimistic update by removing the optimistic reply recursively
      const removeOptimisticReply = (comments: Comment[], optimisticId: number): Comment[] => {
        return comments.map((comment) => {
          if (comment.replies) {
            // Remove the optimistic reply if it's directly in this comment's replies
            const filteredReplies = comment.replies.filter((r) => r.comment_id !== optimisticId);

            // If we removed something and now replies are empty, remove the replies array
            if (filteredReplies.length !== comment.replies.length && filteredReplies.length === 0) {
              const { replies, ...commentWithoutReplies } = comment;
              return commentWithoutReplies;
            }

            // Check nested replies
            return {
              ...comment,
              replies: removeOptimisticReply(filteredReplies, optimisticId)
            };
          }
          return comment;
        });
      };

      // Update state to remove the optimistic reply
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

  // This function now expects parameters from the CommentCard component
  const handleNestedReplySubmit = async (replyId: number, content: string) => {
    if (!user || !content.trim() || isSubmitting || isSubmittingRef.current) return;

    try {
      // Pass both the reply ID and content to the handleReplySubmit function
      await handleReplySubmit(replyId, content);
      return true; // Return success status
    } catch (error) {
      console.error('Error submitting nested reply:', error);
      return false; // Return failure status
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

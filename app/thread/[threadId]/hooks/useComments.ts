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
        account_avatar_url: user.user_metadata?.avatar_url
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
          account_avatar_url: avatarUrl // Use account_avatar_url instead of avatar_url to match the database column
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
            account_avatar_url
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

      // Get the thread author to notify them about the new comment
      const { data: threadData, error: threadError } = await supabase.from('Thread').select('author_id').eq('thread_id', thread.thread_id).single();

      if (threadError) {
        console.error('Error fetching thread author:', threadError);
      } else if (threadData && threadData.author_id !== user.id) {
        // Create notification for thread comment
        const notificationData = {
          recipient_id: threadData.author_id,
          sender_id: user.id,
          thread_id: thread.thread_id,
          comment_id: data.comment_id,
          type: 'COMMENT',
          is_read: false,
          created_at: new Date().toISOString()
        };

        // Validate notification data
        const missingFields = Object.entries(notificationData)
          .filter(([_, value]) => value === undefined || value === null)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          console.error(`Cannot create notification: missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log('Attempting to create notification with data:', notificationData);
          try {
            // Use 'notifications' (plural and lowercase) as the table name to match the schema
            const { error: notificationError } = await supabase.from('notifications').insert(notificationData);

            if (notificationError) {
              console.error('Error creating notification:', notificationError.message || JSON.stringify(notificationError));
              console.error('Error details:', notificationError);
              // Continue execution - don't throw an error here
            } else {
              console.log('Thread comment notification created successfully');
            }
          } catch (notifError) {
            console.error('Exception creating notification:', notifError);
            // Continue execution - notification errors shouldn't block comment posting
          }
        }
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
        account_avatar_url: user.user_metadata?.avatar_url
      }
    };

    // Optimistically update UI by adding the reply to the correct parent comment
    setThread((prev) => ({
      ...prev,
      comments: prev.comments.map((comment) => {
        if (comment.comment_id === parentCommentId) {
          // Add to the parent comment's replies
          const updatedComment = { ...comment };
          if (!updatedComment.replies) {
            updatedComment.replies = [];
          }
          updatedComment.replies = [...updatedComment.replies, optimisticReply];
          return updatedComment;
        } else if (comment.parent_comment_id === parentCommentId) {
          // If we're replying to a reply that's directly in the main comment list
          const updatedReplies = prev.comments.filter((c) => c.parent_comment_id === parentCommentId || c.comment_id === parentCommentId).concat([optimisticReply]);

          return comment;
        }
        return comment;
      })
    }));

    // Only clear replyContent if we're using it (not using passed content parameter)
    if (!content) {
      setReplyContent('');
      setReplyingTo(null);
    }

    try {
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
          account_avatar_url: avatarUrl // Use account_avatar_url instead of avatar_url
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
            account_avatar_url
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

      // Get the parent comment author to notify them about the reply
      const { data: parentCommentData, error: parentCommentError } = await supabase.from('Comment').select('author_id').eq('comment_id', parentCommentId).single();

      if (parentCommentError) {
        console.error('Error fetching parent comment author:', parentCommentError);
      } else if (parentCommentData && parentCommentData.author_id !== user.id) {
        // Create notification for comment reply
        const notificationData = {
          recipient_id: parentCommentData.author_id,
          sender_id: user.id,
          thread_id: thread.thread_id,
          comment_id: data.comment_id,
          type: 'REPLY',
          is_read: false,
          created_at: new Date().toISOString()
        };

        // Validate notification data
        const missingFields = Object.entries(notificationData)
          .filter(([_, value]) => value === undefined || value === null)
          .map(([key]) => key);

        if (missingFields.length > 0) {
          console.error(`Cannot create notification: missing fields: ${missingFields.join(', ')}`);
        } else {
          console.log('Attempting to create notification with data:', notificationData);
          try {
            // Use 'notifications' (plural and lowercase) as the table name to match the schema
            const { error: notificationError } = await supabase.from('notifications').insert(notificationData);

            if (notificationError) {
              console.error('Error creating notification:', notificationError.message || JSON.stringify(notificationError));
              console.error('Error details:', notificationError);
              // Continue execution - don't throw an error here
            } else {
              console.log('Comment reply notification created successfully');
            }
          } catch (notifError) {
            console.error('Exception creating notification:', notifError);
            // Continue execution - notification errors shouldn't block comment posting
          }
        }
      }

      // Update UI with actual data
      setThread((prev) => {
        // Replace the optimistic comment with the real one
        const updatedComments = prev.comments.map((comment) => {
          if (comment.comment_id === optimisticReply.comment_id) {
            return data;
          }

          if (comment.comment_id === parentCommentId && comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map((reply) => (reply.comment_id === optimisticReply.comment_id ? data : reply))
            };
          }

          return comment;
        });

        // Make sure the reply appears in the right place
        return {
          ...prev,
          comments: updatedComments
        };
      });

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

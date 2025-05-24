import { useState, useCallback } from 'react';
import { Comment } from '../interfaces';
import { deduplicateReplies } from '../utils/commentUtils';

interface UseCommentManagementProps {
  initialComments: Comment[];
  user: any | null;
  handleReplySubmit: (parentCommentId: number, content?: string) => Promise<void>;
  handleNestedReplySubmit?: (replyId: number, content: string) => Promise<boolean | void>;
}

export const useCommentManagement = ({ initialComments, user, handleReplySubmit, handleNestedReplySubmit }: UseCommentManagementProps) => {
  const [localComments, setLocalComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyingToNestedId, setReplyingToNestedId] = useState<number | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const [showNestedReplies, setShowNestedReplies] = useState<Record<number, boolean>>({});

  const updateCommentReplies = useCallback((commentId: number, newReplies: Comment[]) => {
    setLocalComments((prevComments) => prevComments.map((comment) => (comment.comment_id === commentId ? { ...comment, replies: newReplies } : comment)));
  }, []);

  const toggleNestedReplies = useCallback((replyId: number) => {
    setShowNestedReplies((prev) => ({
      ...prev,
      [replyId]: !prev[replyId]
    }));
  }, []);

  const onNestedReplySubmit = async (replyId: number, parentCommentId: number) => {
    if (!nestedReplyContent.trim()) return;

    try {
      const success = handleNestedReplySubmit ? await handleNestedReplySubmit(replyId, nestedReplyContent) : await handleReplySubmit(replyId, nestedReplyContent);

      if (success !== false) {
        const newReply: Comment = {
          comment_id: Date.now(),
          comment_content: nestedReplyContent,
          comment_created: new Date().toISOString(),
          comment_deleted: false,
          parent_comment_id: replyId,
          author: user,
          replies: []
        };

        const updatedReplies = [...(localComments.find((c) => c.comment_id === parentCommentId)?.replies || [])].map((reply) => (reply.comment_id === replyId ? { ...reply, replies: [...(reply.replies || []), newReply] } : reply));

        updateCommentReplies(parentCommentId, updatedReplies);

        setNestedReplyContent('');
        setReplyingToNestedId(null);
        setShowNestedReplies((prev) => ({
          ...prev,
          [replyId]: true
        }));
      }
    } catch (error) {
      console.error('Error submitting nested reply:', error);
    }
  };

  return {
    localComments,
    setLocalComments,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    replyingToNestedId,
    setReplyingToNestedId,
    nestedReplyContent,
    setNestedReplyContent,
    showNestedReplies,
    setShowNestedReplies,
    updateCommentReplies,
    toggleNestedReplies,
    onNestedReplySubmit
  };
};

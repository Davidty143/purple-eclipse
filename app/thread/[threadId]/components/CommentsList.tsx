'use client';

import { useEffect } from 'react';
import { Comment, Thread } from './interfaces';
import { CommentCard } from './CommentCard';
import { useCommentManagement } from './hooks/useCommentManagement';

interface CommentsListProps {
  thread: Thread;
  user: any | null;
  isSubmitting: boolean;
  handleReplySubmit: (parentCommentId: number, content?: string) => Promise<void>;
  handleNestedReplySubmit?: (replyId: number, content: string) => Promise<boolean | void>;
}

export default function CommentsList({ thread, user, isSubmitting, handleReplySubmit, handleNestedReplySubmit }: CommentsListProps) {
  const { localComments, setLocalComments, replyingTo, setReplyingTo, replyContent, setReplyContent, updateCommentReplies } = useCommentManagement({
    initialComments: thread.comments,
    user,
    handleReplySubmit,
    handleNestedReplySubmit
  });

  // Update local comments when thread comments change
  useEffect(() => {
    setLocalComments(thread.comments);
  }, [thread.comments, setLocalComments]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Comments</h2>
        <div className="text-xs sm:text-sm text-gray-500">{localComments.reduce((total, comment) => total + (!comment.comment_deleted ? 1 : 0) + (comment.replies?.filter((reply) => !reply.comment_deleted).length || 0), 0)} comments</div>
      </div>

      {/* Comments List */}
      <div className="space-y-3 sm:space-y-4">
        {localComments
          .filter((comment) => !comment.comment_deleted && !comment.parent_comment_id)
          .map((comment) => (
            <CommentCard key={`comment-${comment.comment_id}`} comment={comment} user={user} isSubmitting={isSubmitting} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyContent={replyContent} setReplyContent={setReplyContent} handleReplySubmit={handleReplySubmit} handleNestedReplySubmit={handleNestedReplySubmit} updateCommentReplies={updateCommentReplies} />
          ))}
      </div>
    </div>
  );
}

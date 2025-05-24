import { Comment } from '../../components/interfaces';
import { CommentUtils } from './types';

export const generateUniqueId: CommentUtils['generateUniqueId'] = (prefix = 1) => {
  return -Math.floor(Date.now() * Math.random() * 10000 * prefix);
};

export const findParentComment: CommentUtils['findParentComment'] = (comments: Comment[], targetId: number) => {
  for (const comment of comments) {
    if (comment.comment_id === targetId) {
      return { parentComment: comment, grandParentComment: null };
    }
    if (comment.replies) {
      for (const reply of comment.replies) {
        if (reply.comment_id === targetId) {
          return { parentComment: reply, grandParentComment: comment };
        }
      }
    }
  }
  return { parentComment: null, grandParentComment: null };
};

export const removeOptimisticReply = (comments: Comment[], optimisticId: number): Comment[] => {
  return comments.map((comment) => {
    if (comment.replies) {
      const filteredReplies = comment.replies.filter((r) => r.comment_id !== optimisticId);

      if (filteredReplies.length !== comment.replies.length && filteredReplies.length === 0) {
        const { replies, ...commentWithoutReplies } = comment;
        return commentWithoutReplies;
      }

      return {
        ...comment,
        replies: removeOptimisticReply(filteredReplies, optimisticId)
      };
    }
    return comment;
  });
};

export const createOptimisticComment = (content: string, user: any, parentCommentId?: number): Comment => ({
  comment_id: generateUniqueId(parentCommentId ? 2 : 1),
  comment_content: content.trim(),
  comment_created: new Date().toISOString(),
  comment_deleted: false,
  parent_comment_id: parentCommentId,
  author: {
    account_username: user.user_metadata?.username || 'Anonymous',
    account_email: user.email || '',
    account_avatar_url: user.user_metadata?.avatar_url
  }
});

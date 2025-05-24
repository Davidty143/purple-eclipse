import { Comment } from '../interfaces';

export const deduplicateReplies = (replies: Comment[] | undefined): Comment[] => {
  if (!replies || replies.length === 0) return [];

  const uniqueReplies = new Map<number, Comment>();
  replies.filter((reply) => !reply.comment_deleted).forEach((reply) => uniqueReplies.set(reply.comment_id, reply));

  return Array.from(uniqueReplies.values()).sort((a, b) => new Date(a.comment_created).getTime() - new Date(b.comment_created).getTime());
};

export const getFilteredNestedReplies = (reply: Comment): Comment[] => {
  if (!reply.replies) return [];
  return reply.replies.filter((r) => !r.comment_deleted);
};

export const MAX_COMMENT_CHARS = 1000;

export const isNearCharLimit = (content: string): boolean => content.length >= MAX_COMMENT_CHARS - 100;

export const getCurrentChars = (content: string): number => content.length;

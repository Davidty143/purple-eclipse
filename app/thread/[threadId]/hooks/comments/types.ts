import { Thread, Comment } from '../../components/interfaces';

export interface CommentState {
  thread: Thread;
  newComment: string;
  isSubmitting: boolean;
  replyingTo: number | null;
  replyContent: string;
}

export interface CommentHandlers {
  setThread: (thread: Thread) => void;
  setNewComment: (content: string) => void;
  setReplyingTo: (id: number | null) => void;
  setReplyContent: (content: string) => void;
  handleCommentSubmit: (e: React.FormEvent) => Promise<void>;
  handleReplySubmit: (parentCommentId: number, content?: string) => Promise<void>;
  handleNestedReplySubmit: (replyId: number, content: string) => Promise<boolean>;
}

export interface CommentContext {
  thread: Thread;
  isSubmitting: boolean;
  replyingTo: number | null;
  replyContent: string;
  newComment: string;
}

export interface CommentUtils {
  generateUniqueId: (prefix?: number) => number;
  findParentComment: (comments: Comment[], targetId: number) => { parentComment: Comment | null; grandParentComment: Comment | null };
}

export interface NotificationData {
  recipient_id: string;
  sender_id: string;
  thread_id: number;
  comment_id: number;
  type: 'COMMENT' | 'REPLY';
  is_read: boolean;
  created_at: string;
}

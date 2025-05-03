export interface Notification {
  notification_id: number;
  recipient_id: string;
  sender_id: string;
  comment_id: number | null;
  thread_id: number | null;
  type: 'COMMENT' | 'REPLY';
  is_read: boolean;
  created_at: string;
  sender: {
    account_username: string;
    account_avatar_url: string | null;
  };
  thread?: {
    thread_title: string;
  };
}

import { createBrowserClient } from '@supabase/ssr';
import { NotificationData } from './types';

export const createNotification = async (notificationData: NotificationData): Promise<void> => {
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  // Validate notification data
  const missingFields = Object.entries(notificationData)
    .filter(([_, value]) => value === undefined || value === null)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    console.error(`Cannot create notification: missing fields: ${missingFields.join(', ')}`);
    return;
  }

  try {
    const { error: notificationError } = await supabase.from('notifications').insert(notificationData);

    if (notificationError) {
      console.error('Error creating notification:', notificationError.message || JSON.stringify(notificationError));
      console.error('Error details:', notificationError);
    } else {
      console.log(`${notificationData.type} notification created successfully`);
    }
  } catch (error) {
    console.error('Exception creating notification:', error);
  }
};

export const createCommentNotification = async (recipientId: string, senderId: string, threadId: number, commentId: number, type: 'COMMENT' | 'REPLY'): Promise<void> => {
  const notificationData: NotificationData = {
    recipient_id: recipientId,
    sender_id: senderId,
    thread_id: threadId,
    comment_id: commentId,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  await createNotification(notificationData);
};

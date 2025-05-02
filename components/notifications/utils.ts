import { format } from 'date-fns';
import { Notification } from './types';

export const getNotificationText = (notification: Notification) => {
  const username = notification.sender.account_username || 'Someone';
  const threadTitle = notification.thread?.thread_title || 'a thread';

  switch (notification.type) {
    case 'COMMENT':
      return `${username} commented on ${threadTitle}`;
    case 'REPLY':
      return `${username} replied to your comment`;
    default:
      return 'You have a new notification';
  }
};

export const getNotificationLink = (notification: Notification) => {
  if (notification.thread_id) {
    return `/thread/${notification.thread_id}${notification.comment_id ? `#comment-${notification.comment_id}` : ''}`;
  }
  return '#';
};

export const getTimeAgo = (timestamp: string) => {
  try {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  } catch (e) {
    return 'recently';
  }
};

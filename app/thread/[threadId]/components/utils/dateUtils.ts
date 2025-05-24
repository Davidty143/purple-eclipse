import { format, formatDistanceToNow } from 'date-fns';

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return 'yesterday';
  } else if (diffInHours < 168) {
    // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return format(date, 'MMM d, yyyy');
  }
};

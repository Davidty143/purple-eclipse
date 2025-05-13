'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
  };
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col gap-1 max-w-[80%]', isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start')}>
      <div className={cn('px-4 py-2 rounded-lg text-sm', 'whitespace-pre-wrap break-words overflow-hidden break-all', isCurrentUser ? 'bg-[#267858] text-white' : 'bg-gray-200 text-black')}>{message.content}</div>
      <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'MMM d, h:mm a')}</span>
    </div>
  );
}

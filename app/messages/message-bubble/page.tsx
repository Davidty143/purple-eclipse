// components/messages/message-bubble.tsx
'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string; // Keep content here for compatibility
    created_at: string;
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
  };
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div className={cn('flex flex-col max-w-xs gap-1', isCurrentUser ? 'ml-auto items-end' : 'mr-auto items-start')}>
      <div className={cn('px-4 py-2 rounded-lg', isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{message.content}</div>
      <span className="text-xs text-muted-foreground">{format(new Date(message.created_at), 'MMM d, h:mm a')}</span>
    </div>
  );
}

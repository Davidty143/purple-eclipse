// components/messages/message-list.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MessageBubble } from '../message-bubble/page';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  otherUserId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function MessageList({ messages, currentUserId, otherUserId, setMessages }: MessageListProps) {
  const supabase = createClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`realtime_messages_${currentUserId}_${otherUserId}`, {
        config: {
          presence: { key: `user_${currentUserId}` },
          broadcast: { ack: true }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${currentUserId}`
        },
        (payload) => {
          console.log('New message received:', payload.new);
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto h-[calc(100vh-180px)]">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isCurrentUser={message.sender_id === currentUserId} />
      ))}
    </div>
  );
}

// components/messages/MessageList.tsx
'use client';

import { createClient } from '@/app/utils/supabase/client';
import { useEffect, useRef } from 'react';
import MessageBubble from '@/app/messages/message-bubble/components/MessageBubble';

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

const supabase = createClient();

const MessageList = ({ messages, currentUserId, otherUserId, setMessages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter((msg) => msg.sender_id === otherUserId && !msg.is_read);

      if (unreadMessages.length > 0) {
        const { error } = await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .in(
            'id',
            unreadMessages.map((msg) => msg.id)
          );

        if (!error) {
          setMessages((prev) => prev.map((msg) => (msg.sender_id === otherUserId && !msg.is_read ? { ...msg, is_read: true } : msg)));
        }
      }
    };

    markMessagesAsRead();
  }, [messages, otherUserId, setMessages]);

  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isCurrentUser={message.sender_id === currentUserId} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

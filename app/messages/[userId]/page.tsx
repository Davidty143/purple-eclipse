// app/messages/[userId]/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageList } from '../messages-list/page';
import { MessageInput } from '../message-input/page';
import ConversationsList from '../conversations-list/page';
import { use } from 'react';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
}

export default function MessagePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        redirect('/login');
      }
      setCurrentUser(user);

      const { data: messages } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),` + `and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      setMessages(messages || []);
    };

    fetchData();
  }, [userId]);

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto pt-4">
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        <div className="w-1/4 border-r bg-background">
          <ConversationsList userId={currentUser.id} />
        </div>
        <div className="w-3/4 flex flex-col bg-background">
          <div className="border-b p-4 bg-card">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          <MessageList messages={messages} currentUserId={currentUser.id} otherUserId={userId} setMessages={setMessages} />
          <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
        </div>
      </div>
    </div>
  );
}

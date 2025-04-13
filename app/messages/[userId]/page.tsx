// app/messages/[userId]/page.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MessageList } from '../messages-list/page';
import { MessageInput } from '../message-input/page';
import ConversationsList from '../conversations-list/page';
import { use } from 'react';
import { UserSearch } from '../user-search/page';
import { cn } from '@/lib/utils';
import { MessageCircle, User } from 'lucide-react';

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
  const [isValidConversation, setIsValidConversation] = useState(true);
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

      // Check if conversation exists
      const { data: conversation } = await supabase.from('direct_messages').select('id').or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`).limit(1);

      if (!conversation || conversation.length === 0) {
        setIsValidConversation(false);
        return;
      }

      const { data: messages } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true });

      setMessages(messages || []);
    };

    fetchData();
  }, [userId]);

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!isValidConversation) {
    return (
      <div className={cn('w-full max-w-[1250px] xl:w-[80%] mx-auto py-4')}>
        <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
          <div className="w-1/4 border-r bg-background flex flex-col">
            <UserSearch currentUserId={currentUser.id} />
            <div className="flex-1 overflow-y-auto">
              <ConversationsList userId={currentUser.id} />
            </div>
          </div>
          <div className="w-3/4 flex flex-col bg-background">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Conversation not found</p>
                <p className="text-sm text-muted-foreground mt-2">Select a valid conversation from the list</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-[1250px] xl:w-[80%] mx-auto py-4')}>
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        <div className="w-1/4 border-r bg-background flex flex-col">
          <UserSearch currentUserId={currentUser.id} />
          <div className="flex-1 overflow-y-auto">
            <ConversationsList userId={currentUser.id} />
          </div>
        </div>
        <div className="w-3/4 flex flex-col bg-background">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          {messages.length > 0 ? (
            <>
              <MessageList messages={messages} currentUserId={currentUser.id} otherUserId={userId} setMessages={setMessages} />
              <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">Start the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

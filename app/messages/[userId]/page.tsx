// app/messages/[userId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ConversationsList from '../conversations-list/page';
import { UserSearch } from '../user-search/page';
import { MessageList } from '../messages-list/page';
import { MessageInput } from '../message-input/page';
import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import MessageHeader from '../message-header/page';
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
  // Unwrap the Promise to access userId
  const { userId } = use(params);

  const supabase = createClient();

  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'Messages';

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the username for the userId (other user in the conversation)
  const [otherUser, setOtherUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/login');
      }

      setCurrentUser(user);

      const { data: otherUserData } = await supabase.from('Account').select('account_username').eq('account_id', userId).single(); // Fetch the username for the other user

      setOtherUser(otherUserData);

      const { data: messages } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true });

      setMessages(messages || []);
      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  if (!currentUser || isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className={cn('w-full max-w-[1250px] xl:w-[80%] mx-auto py-4')}>
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        <div className="w-1/4 border-r bg-background flex flex-col">
          <UserSearch currentUserId={currentUser.id} />
          <div className="flex-1 overflow-y-auto">
            <ConversationsList userId={currentUser.id} selectedReceiverId={userId} />
          </div>
        </div>
        <div className="w-3/4 flex flex-col bg-background">
          <div className="p-4 border-b">
            {/* Pass the username of the other user */}
            <MessageHeader username={otherUser?.account_username || 'Messages'} />
          </div>
          {messages.length > 0 ? (
            <>
              <MessageList messages={messages} currentUserId={currentUser.id} otherUserId={userId} setMessages={setMessages} />
              <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
            </>
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-6">
                  <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Start the conversation</p>
                </div>
              </div>
              <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

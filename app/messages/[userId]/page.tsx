'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ConversationsList from '../conversations-list/page';
import { UserSearch } from '../user-search/page';
import { MessageList } from '../messages-list/page';
import { MessageInput } from '../message-input/page';
import { cn } from '@/lib/utils';
import { MessageCircle, ListPlus } from 'lucide-react';
import MessageHeader from '../message-header/page';
import { Skeleton } from '@/components/ui/skeleton';

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
  const supabase = createClient();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'Messages';

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) redirect('/login');
      setCurrentUser(user);

      const { data: otherUserData } = await supabase.from('Account').select('account_username').eq('account_id', userId).single();

      setOtherUser(otherUserData);

      const { data: messages } = await supabase.from('direct_messages').select('*').or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`).order('created_at', { ascending: true });

      setMessages(messages || []);
      setIsLoading(false);
    };

    fetchData();
  }, [userId]);

  if (isLoading || !currentUser) {
    return (
      <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto py-4">
        <div className="flex md:flex-row flex-col h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
          <div className="w-full md:w-1/4 border-r bg-background flex flex-col">
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="h-px w-full bg-gray-200" />
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-3/4 flex flex-col">
            <div className="p-4 border-b">
              <Skeleton className="h-6 w-1/3" />
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-[1250px] xl:w-[80%] mx-auto py-4')}>
      <div className="flex md:flex-row flex-col h-[calc(100vh-160px)] border rounded-lg overflow-hidden relative">
        {/* --- Desktop Sidebar --- */}
        <div className="hidden md:flex w-1/4 border-r bg-background flex-col">
          <UserSearch currentUserId={currentUser.id} />
          <div className="flex-1 overflow-y-auto">
            <ConversationsList userId={currentUser.id} selectedReceiverId={userId} onSelect={() => setShowSidebar(false)} />
          </div>
        </div>

        {/* --- Mobile Drawer --- */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowSidebar(false)}>
            <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-background border-l shadow-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center">
                <p className="font-semibold">Conversations</p>
                <button onClick={() => setShowSidebar(false)}>✕</button>
              </div>
              <UserSearch currentUserId={currentUser.id} />
              <div className="flex-1 overflow-y-auto">
                <ConversationsList userId={currentUser.id} selectedReceiverId={userId} onSelect={() => setShowSidebar(false)} />
              </div>
            </div>
          </div>
        )}

        {/* --- Message Panel --- */}
        <div className="w-full md:w-3/4 flex flex-col bg-background">
          {/* Mobile header with menu button on the right */}
          <div className="md:hidden p-4 border-b flex items-center justify-between">
            <MessageHeader username={otherUser?.account_username || 'Messages'} />
            <button onClick={() => setShowSidebar(true)} className="text-muted-foreground">
              <ListPlus className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop header with labels on the left */}
          <div className="hidden md:block p-4 border-b flex justify-between">
            <MessageHeader username={otherUser?.account_username || 'Messages'} />
            <button onClick={() => setShowSidebar(true)} className="text-muted-foreground md:hidden">
              <ListPlus className="h-6 w-6" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto pb-16">
            {' '}
            {/* Added padding-bottom */}
            {messages.length > 0 ? (
              <MessageList messages={messages} currentUserId={currentUser.id} otherUserId={userId} setMessages={setMessages} />
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

          <div className="hidden md:block bg-background">
            <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
          </div>
        </div>
      </div>

      <div className="md:hidden w-full bg-background border-t">
        <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useSearchParams, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ConversationsList from '../conversations-list/page';
import { UserSearch } from '../user-search/page';
import { MessageList } from '../messages-list/page';
import { MessageInput } from '../message-input/page';
import { cn } from '@/lib/utils';
import { MessageCircle, ListPlus, X } from 'lucide-react';
import MessageHeader from '../message-header/page';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading || !currentUser) {
    return (
      <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto py-4 md:px-4 xl:px-2">
        <div className="flex md:flex-row flex-col h-[calc(100vh-160px)] border rounded-lg bg-background">
          {/* Sidebar Skeleton */}
          <div className="hidden md:flex flex-col w-full md:w-1/4 border-r">
            <div className="p-4">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="border-b" />
            <div className="flex-1 min-h-0 p-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header Skeleton */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-7 w-32 rounded" />
              </div>
              <Skeleton className="h-7 w-7 rounded md:hidden" />
            </div>

            {/* Message List Skeleton */}
            <div className="flex-1 min-h-0 p-4 space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'} rounded-lg ${i % 2 === 0 ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input Skeleton */}
            <div className="shrink-0 p-4 border-t">
              <div className="flex items-center gap-2">
                <Skeleton className="flex-1 h-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto md:px-4 xl:px-2 py-4">
      <div className="flex md:flex-row flex-col h-[calc(100vh-160px)] border md:rounded-md bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-full md:w-1/4 border-r">
          <div className="">
            <UserSearch currentUserId={currentUser.id} />
          </div>
          <div className="border-b" />
          <div className="flex-1 min-h-0">
            <ConversationsList userId={currentUser.id} selectedReceiverId={userId} onSelect={() => setShowSidebar(false)} />
          </div>
        </div>

        {/* Mobile Sidebar Overlay with Animation */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setShowSidebar(false)} />

              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-background border-l shadow-lg flex flex-col z-50" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="font-semibold text-lg">Conversations</h2>
                  <motion.button onClick={() => setShowSidebar(false)} className="p-1 rounded-full hover:bg-accent" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="">
                  <UserSearch currentUserId={currentUser.id} />
                </div>
                <div className="border-b" />
                <div className="flex-1 min-h-0">
                  <ConversationsList userId={currentUser.id} selectedReceiverId={userId} onSelect={() => setShowSidebar(false)} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="p-3 md:p-4 border-b flex items-center justify-between">
            <MessageHeader username={otherUser?.account_username || 'Messages'} />
            <motion.button onClick={() => setShowSidebar(true)} className="md:hidden text-muted-foreground p-1 rounded-md hover:bg-accent" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ListPlus className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Message List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 md:p-4">
            {messages.length > 0 ? (
              <>
                <MessageList messages={messages} currentUserId={currentUser.id} otherUserId={userId} setMessages={setMessages} />
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Send your first message to start the conversation</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t">
            <MessageInput receiverId={userId} currentUserId={currentUser.id} setMessages={setMessages} />
          </div>
        </div>
      </div>
    </div>
  );
}

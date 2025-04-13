// components/messages/conversations-list.tsx
'use client';

import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversationPartner {
  id: string;
  username: string;
  last_message?: string;
  unread_count?: number;
  last_message_at?: string;
}

export default function ConversationsList({ userId }: { userId: string }) {
  const supabase = createClient();
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);

      try {
        // Get all conversations for this user
        const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, content, created_at, is_read').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false });

        if (conversations) {
          // Get unique partner IDs with last message
          const partnerMap = new Map<string, ConversationPartner>();

          conversations.forEach((conv) => {
            const partnerId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
            if (!partnerMap.has(partnerId) || new Date(conv.created_at) > new Date(partnerMap.get(partnerId)?.last_message_at || 0)) {
              partnerMap.set(partnerId, {
                id: partnerId,
                username: '', // Will be filled later
                last_message: conv.content,
                unread_count: conv.sender_id !== userId && !conv.is_read ? 1 : 0,
                last_message_at: conv.created_at
              });
            }
          });

          // Fetch usernames
          const { data: users } = await supabase.from('Account').select('account_id, account_username').in('account_id', Array.from(partnerMap.keys()));

          if (users) {
            const enrichedPartners = Array.from(partnerMap.values()).map((partner) => ({
              ...partner,
              username: users.find((u) => u.account_id === partner.id)?.account_username || 'Unknown User'
            }));
            setPartners(enrichedPartners);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const channel = supabase
      .channel('conversations_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold px-2 py-3">Conversations</h2>
      <div className="space-y-1">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new conversation from your connections</p>
          </div>
        ) : (
          partners.map((partner) => (
            <Link key={partner.id} href={`/messages/${partner.id}`} className={cn('flex items-center p-3 rounded-lg transition-colors', 'hover:bg-muted/50', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{partner.username.charAt(0).toUpperCase()}</div>
                {partner.unread_count ? <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{partner.unread_count}</span> : null}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium truncate">{partner.username}</p>
                  {partner.last_message_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(partner.last_message_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{partner.last_message || 'No messages yet'}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

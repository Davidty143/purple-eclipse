'use client';

import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationPartner {
  id: string;
  username: string;
  last_message?: string;
  unread_count?: number;
  last_message_at?: string;
}

export default function ConversationsList({ userId, selectedReceiverId, onSelect }: { userId: string; selectedReceiverId: string; onSelect?: () => void }) {
  const supabase = createClient();
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, content, created_at, is_read').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false });

        if (conversations) {
          const partnerMap = new Map<string, ConversationPartner>();
          conversations.forEach((conv) => {
            const partnerId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
            if (!partnerMap.has(partnerId) || new Date(conv.created_at) > new Date(partnerMap.get(partnerId)?.last_message_at || 0)) {
              partnerMap.set(partnerId, {
                id: partnerId,
                username: '',
                last_message: conv.sender_id === userId ? `You: ${conv.content}` : conv.content,
                unread_count: conv.sender_id !== userId && !conv.is_read ? 1 : 0,
                last_message_at: conv.created_at
              });
            }
          });

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

    const handleNewMessage = async (payload: any) => {
      const newMessage = payload.new;
      const partnerId = newMessage.sender_id === userId ? newMessage.receiver_id : newMessage.sender_id;
      const isIncoming = newMessage.sender_id !== userId;

      setPartners((prevPartners) => {
        const existingPartnerIndex = prevPartners.findIndex((p) => p.id === partnerId);

        if (existingPartnerIndex >= 0) {
          const updatedPartners = [...prevPartners];
          updatedPartners[existingPartnerIndex] = {
            ...updatedPartners[existingPartnerIndex],
            last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
            last_message_at: newMessage.created_at,
            unread_count: isIncoming && !newMessage.is_read ? (updatedPartners[existingPartnerIndex].unread_count || 0) + 1 : 0
          };

          const [movedPartner] = updatedPartners.splice(existingPartnerIndex, 1);
          return [movedPartner, ...updatedPartners];
        } else {
          return prevPartners;
        }
      });

      const partnerExists = partners.some((p) => p.id === partnerId);
      if (!partnerExists) {
        const { data: user } = await supabase.from('Account').select('account_id, account_username').eq('account_id', partnerId).single();

        setPartners((prevPartners) => {
          const alreadyExists = prevPartners.some((p) => p.id === partnerId);
          if (alreadyExists) return prevPartners;

          const newPartner = {
            id: partnerId,
            username: user?.account_username || 'Unknown User',
            last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
            unread_count: isIncoming && !newMessage.is_read ? 1 : 0,
            last_message_at: newMessage.created_at
          };
          return [newPartner, ...prevPartners];
        });
      }
    };

    // Realtime subscription for incoming messages
    const incomingChannel = supabase
      .channel('incoming_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`
        },
        handleNewMessage
      )
      .subscribe();

    // Realtime subscription for sent messages
    const outgoingChannel = supabase
      .channel('outgoing_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${userId}`
        },
        handleNewMessage
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incomingChannel);
      supabase.removeChannel(outgoingChannel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-center text-muted-foreground"></p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="space-y-1">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a new conversation from your connections</p>
          </div>
        ) : (
          partners.map((partner) => {
            // Highlight the selected conversation based on selectedReceiverId
            const isSelected = partner.id === selectedReceiverId;

            return (
              <Link
                key={partner.id}
                href={`/messages/${partner.id}`}
                onClick={onSelect}
                className={cn('flex items-center p-3 rounded-lg transition-colors', 'hover:bg-muted/50', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', {
                  'bg-muted': isSelected
                })}>
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
            );
          })
        )}
      </div>
    </div>
  );
}

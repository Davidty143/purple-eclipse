'use client';

import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  useEffect(() => {
    if (!selectedReceiverId) return;

    const markMessagesAsRead = async () => {
      const { error } = await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', userId).eq('sender_id', selectedReceiverId).eq('is_read', false);

      if (!error) {
        setPartners((prev) => prev.map((p) => (p.id === selectedReceiverId ? { ...p, unread_count: 0 } : p)));
      }
    };

    markMessagesAsRead();
  }, [selectedReceiverId, userId, supabase]);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, content, created_at, is_read').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false });

        if (conversations) {
          const partnerMap = new Map<string, ConversationPartner>();

          conversations.forEach((conv) => {
            const partnerId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
            const isIncoming = conv.sender_id !== userId;

            if (!partnerMap.has(partnerId)) {
              partnerMap.set(partnerId, {
                id: partnerId,
                username: '',
                last_message: isIncoming ? conv.content : `You: ${conv.content}`,
                unread_count: 0,
                last_message_at: conv.created_at
              });
            }

            const partner = partnerMap.get(partnerId)!;

            if (isIncoming && !conv.is_read && partnerId !== selectedReceiverId) {
              partner.unread_count = (partner.unread_count || 0) + 1;
            }

            if (new Date(conv.created_at) > new Date(partner.last_message_at || 0)) {
              partner.last_message = isIncoming ? conv.content : `You: ${conv.content}`;
              partner.last_message_at = conv.created_at;
            }
          });

          const { data: users } = await supabase.from('Account').select('account_id, account_username').in('account_id', Array.from(partnerMap.keys()));

          if (users) {
            const enriched = Array.from(partnerMap.values()).map((p) => ({
              ...p,
              username: users.find((u) => u.account_id === p.id)?.account_username ?? 'Unknown'
            }));
            setPartners(enriched);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const handleMessageUpdate = async (payload: any) => {
      const newMessage = payload.new;
      const partnerId = newMessage.sender_id === userId ? newMessage.receiver_id : newMessage.sender_id;
      const isIncoming = newMessage.sender_id !== userId;

      if (isIncoming && partnerId === selectedReceiverId) {
        await supabase.from('direct_messages').update({ is_read: true }).eq('id', newMessage.id);
      }

      setPartners((prev) => {
        const index = prev.findIndex((p) => p.id === partnerId);
        const updated = [...prev];

        if (index >= 0) {
          const old = updated[index];
          updated[index] = {
            ...old,
            last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
            last_message_at: newMessage.created_at,
            unread_count: isIncoming && !newMessage.is_read && partnerId !== selectedReceiverId ? (old.unread_count || 0) + 1 : old.unread_count
          };

          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        }

        // New conversation
        const newPartner: ConversationPartner = {
          id: partnerId,
          username: 'Loading...',
          last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
          unread_count: isIncoming && !newMessage.is_read && partnerId !== selectedReceiverId ? 1 : 0,
          last_message_at: newMessage.created_at
        };

        // Fetch username asynchronously
        supabase
          .from('Account')
          .select('account_id, account_username')
          .eq('account_id', partnerId)
          .single()
          .then(({ data }) => {
            if (data) {
              setPartners((prev2) => prev2.map((p) => (p.id === partnerId && p.username === 'Loading...' ? { ...p, username: data.account_username } : p)));
            }
          });

        return [newPartner, ...prev];
      });
    };

    const incoming = supabase
      .channel('incoming-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${userId}`
        },
        handleMessageUpdate
      )
      .subscribe();

    const outgoing = supabase
      .channel('outgoing-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${userId}`
        },
        handleMessageUpdate
      )
      .subscribe();

    return () => {
      supabase.removeChannel(incoming);
      supabase.removeChannel(outgoing);
    };
  }, [userId, selectedReceiverId, supabase]); // ✅ fixed dependencies

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <p className="text-center text-muted-foreground">Loading conversations...</p>
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
            <p className="text-xs text-muted-foreground mt-1">Start a new conversation</p>
          </div>
        ) : (
          partners.map((partner) => (
            <Link key={partner.id} href={`/messages/${partner.id}`} onClick={onSelect} className={cn('flex items-center p-3 rounded-lg transition-colors', 'hover:bg-muted/50', { 'bg-muted': partner.id === selectedReceiverId })}>
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

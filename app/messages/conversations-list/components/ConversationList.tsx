import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ConversationPartner {
  id: string;
  username: string;
  avatar_url?: string; // Add avatar_url to the interface
  last_message?: string;
  unread_count?: number;
  last_message_at?: string;
}

export default function ConversationsList({ userId, selectedReceiverId, onSelect }: { userId: string; selectedReceiverId: string; onSelect?: () => void }) {
  const supabase = createClient();
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedReceiverId) return;

    const markMessagesAsRead = async () => {
      try {
        const { error } = await supabase.from('direct_messages').update({ is_read: true }).eq('receiver_id', userId).eq('sender_id', selectedReceiverId).eq('is_read', false);

        if (!error) {
          setPartners((prev) => prev.map((p) => (p.id === selectedReceiverId ? { ...p, unread_count: 0 } : p)));
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
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

          // Process conversations and store partner data
          for (const conv of conversations) {
            const partnerId = conv.sender_id === userId ? conv.receiver_id : conv.sender_id;
            const isIncoming = conv.sender_id !== userId;

            // If the partner hasn't been processed yet, initialize their data
            if (!partnerMap.has(partnerId)) {
              partnerMap.set(partnerId, {
                id: partnerId,
                username: 'Loading...',
                avatar_url: '', // Initialize avatar_url as empty
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
          }

          // Query the Account table to get the username and avatar_url
          const partnerIds = Array.from(partnerMap.keys());
          const { data: users } = await supabase.from('Account').select('account_id, account_username, account_avatar_url').in('account_id', partnerIds);

          if (users) {
            // Update the partnerMap with usernames and avatar URLs
            users.forEach((user) => {
              if (partnerMap.has(user.account_id)) {
                const partner = partnerMap.get(user.account_id)!;
                partner.username = user.account_username || 'Unknown';
                partner.avatar_url = user.account_avatar_url || ''; // Update avatar_url
              }
            });

            // Convert the partnerMap to an array and set it in the state
            setPartners(Array.from(partnerMap.values()));
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
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
        const existingIndex = prev.findIndex((p) => p.id === partnerId);
        const updatedPartners = [...prev];

        if (existingIndex >= 0) {
          updatedPartners[existingIndex] = {
            ...updatedPartners[existingIndex],
            last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
            last_message_at: newMessage.created_at,
            unread_count: isIncoming && !newMessage.is_read && partnerId !== selectedReceiverId ? (updatedPartners[existingIndex].unread_count || 0) + 1 : updatedPartners[existingIndex].unread_count
          };
          const [updated] = updatedPartners.splice(existingIndex, 1);
          return [updated, ...updatedPartners];
        }

        // Fetch username and avatar for a new partner
        supabase
          .from('Account')
          .select('account_id, account_username, account_avatar_url')
          .eq('account_id', partnerId)
          .single()
          .then(({ data: user }) => {
            if (user) {
              setPartners((latest) => latest.map((p) => (p.id === partnerId && p.username === 'Loading...' ? { ...p, username: user.account_username, avatar_url: user.account_avatar_url || '' } : p)));
            }
          });

        return [
          {
            id: partnerId,
            username: 'Loading...',
            avatar_url: '',
            last_message: isIncoming ? newMessage.content : `You: ${newMessage.content}`,
            unread_count: isIncoming && !newMessage.is_read && partnerId !== selectedReceiverId ? 1 : 0,
            last_message_at: newMessage.created_at
          },
          ...prev
        ];
      });
    };

    const incomingChannel = supabase
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

    const outgoingChannel = supabase
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
      supabase.removeChannel(incomingChannel);
      supabase.removeChannel(outgoingChannel);
    };
  }, [userId, selectedReceiverId, supabase]);

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
            <Link
              key={partner.id}
              href={`/messages/${partner.id}`}
              onClick={onSelect}
              className={cn('flex items-center p-3 rounded-lg transition-colors', 'hover:bg-muted/50', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', {
                'bg-muted': partner.id === selectedReceiverId
              })}>
              <div className="relative">
                {/* Render avatar if available */}
                {partner.avatar_url ? <Image src={partner.avatar_url} alt={`${partner.username}'s avatar`} width={40} height={40} className="rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{partner.username.charAt(0).toUpperCase()}</div>}
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

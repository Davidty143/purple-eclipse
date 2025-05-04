'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationPartner {
  id: string;
  username: string;
  last_message?: string;
  unread_count?: number;
  last_message_at?: string;
}

interface ConversationsListProps {
  userId: string;
  selectedReceiverId: string;
  onSelect: () => void;
}

export default function ConversationsList({ userId, selectedReceiverId, onSelect }: ConversationsListProps) {
  const supabase = createClient();
  const [partners, setPartners] = useState<ConversationPartner[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, content, created_at, is_read').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false });

      const partnerMap = new Map<string, ConversationPartner>();

      conversations?.forEach((conv) => {
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

        if (isIncoming && !conv.is_read) {
          partner.unread_count = (partner.unread_count || 0) + 1;
        }

        if (new Date(conv.created_at) > new Date(partner.last_message_at || 0)) {
          partner.last_message = isIncoming ? conv.content : `You: ${conv.content}`;
          partner.last_message_at = conv.created_at;
        }
      });

      const { data: users } = await supabase.from('Account').select('account_id, account_username').in('account_id', Array.from(partnerMap.keys()));

      const enriched = Array.from(partnerMap.values()).map((p) => ({
        ...p,
        username: users?.find((u) => u.account_id === p.id)?.account_username ?? 'Unknown'
      }));

      setPartners(enriched);
    };

    fetchConversations();
  }, [userId]);

  return (
    <div className="p-2">
      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start a new conversation</p>
        </div>
      ) : (
        partners.map((partner) => (
          <Link key={partner.id} href={`/messages/${partner.id}`} className={cn('flex items-center p-3 rounded-lg transition-colors hover:bg-muted/50', partner.id === selectedReceiverId && 'bg-muted')} onClick={onSelect}>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{partner.username.charAt(0).toUpperCase()}</div>
              {partner.unread_count ? <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">{partner.unread_count}</span> : null}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium truncate">{partner.username}</p>
                <span className="text-xs text-muted-foreground">
                  {partner.last_message_at &&
                    new Date(partner.last_message_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{partner.last_message || 'No messages yet'}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';
import { NotificationDropdown } from '@/components/notifications';

export default function LoggedInHeaderRight() {
  const router = useRouter();
  const { user } = useAuth();
  const [accountData, setAccountData] = useState<{
    account_username: string | null;
    account_avatar_url: string | null;
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user) return;
      const supabase = createClient();

      // First check if account exists
      const { data, error } = await supabase.from('Account').select('account_username, account_avatar_url').eq('account_id', user.id);

      if (!error && data && data.length > 0) {
        setAccountData(data[0]);
      } else {
        // If account doesn't exist or there was an error, create a new account
        console.log('Account not found or error occurred, creating new account');

        // Get avatar URL from user metadata if available
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { error: createAccountError, data: newAccount } = await supabase
          .from('Account')
          .insert({
            account_id: user.id,
            account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
            account_email: user.email,
            account_is_deleted: false,
            account_avatar_url: avatarUrl
          })
          .select('account_username, account_avatar_url')
          .single();

        if (!createAccountError && newAccount) {
          setAccountData(newAccount);
        } else {
          console.error('Failed to create account:', createAccountError);
        }
      }
    };

    fetchAccountData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // Initial fetch of unread messages count per conversation
    const fetchUnreadCount = async () => {
      const { data: conversations, error } = await supabase.from('direct_messages').select('sender_id, is_read').eq('receiver_id', user.id).eq('is_read', false);

      if (!error) {
        // Count unique senders with unread messages
        const uniqueSenders = new Set(conversations.map((msg) => msg.sender_id));
        setUnreadCount(uniqueSenders.size);
      }
    };

    fetchUnreadCount();

    // Realtime subscription for unread messages
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          // Refetch the count when messages change
          const { data: conversations, error } = await supabase.from('direct_messages').select('sender_id, is_read').eq('receiver_id', user.id).eq('is_read', false);

          if (!error) {
            const uniqueSenders = new Set(conversations.map((msg) => msg.sender_id));
            setUnreadCount(uniqueSenders.size);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      router.refresh();
    }
  };

  if (!user) return null;

  const username = accountData?.account_username || '';
  const avatarUrl = accountData?.account_avatar_url || '';
  const fallbackInitial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center gap-4">
      {/* Messages Icon */}
      <Link href="/messages" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Messages">
        <MessageCircle className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center">{unreadCount}</span>}
      </Link>

      {/* Notification Dropdown */}
      <NotificationDropdown userId={user?.id} />

      {/* Avatar + Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center p-1 h-auto hover:bg-transparent focus:bg-transparent cursor-pointer">
            <Avatar className="h-8 w-8">{avatarUrl ? <AvatarImage src={avatarUrl} alt="User avatar" /> : <AvatarFallback>{fallbackInitial}</AvatarFallback>}</Avatar>
            {/* Username and chevron only on md+ */}
            <div className="hidden md:flex items-center gap-1 ml-1">
              <span className="text-sm font-medium">{username}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="px-2 py-1.5">{user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}</div>
          <DropdownMenuItem asChild className="hover:font-semibold">
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:font-semibold">
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[#267858]  focus:text-[#267858] font-medium hover:font-semibold" onClick={handleSignOut}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

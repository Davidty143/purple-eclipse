'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function LoggedInHeaderRight() {
  const router = useRouter();
  const { user } = useAuth();
  const [accountData, setAccountData] = useState<{ account_username: string | null; account_avatar_url: string | null } | null>(null);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase.from('Account').select('account_username, account_avatar_url').eq('account_id', user.id).single();

      if (!error) {
        setAccountData(data);
      } else {
        console.error('Failed to fetch account data:', error);
      }
    };

    fetchAccountData();
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
      <Link href="/messages" className="p-2 rounded-full hover:bg-gray-100 transition-colors relative" aria-label="Messages">
        <MessageCircle className="h-5 w-5" />
      </Link>

      {/* User Profile Dropdown */}
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">{avatarUrl ? <AvatarImage src={avatarUrl} alt="User avatar" /> : <AvatarFallback>{fallbackInitial}</AvatarFallback>}</Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1 p-1 h-auto hover:bg-transparent focus:bg-transparent hover:cursor-pointer">
              <span className="text-sm font-medium">{username}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <div className="px-2 py-1.5">{user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}</div>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500 focus:text-red-500 cursor-pointer" onClick={handleSignOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

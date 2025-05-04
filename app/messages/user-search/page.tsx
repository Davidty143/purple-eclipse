'use client';
import { createClient } from '@/app/utils/supabase/client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface User {
  account_id: string;
  account_username: string;
  account_email: string;
}

export default function UserSearch({ currentUserId }: { currentUserId: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.from('Account').select('account_id, account_username, account_email').ilike('account_username', `%${searchQuery}%`).neq('account_id', currentUserId).limit(10);

      if (error) throw error;
      setSearchResults(data || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, currentUserId, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-4" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onFocus={() => setShowDropdown(true)} />
      </div>

      {searchQuery && showDropdown && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto z-10 bg-background border rounded-md shadow-sm">
          {isSearching ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            ))
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.account_id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{user.account_username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.account_username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild>
                  <Link href={`/messages/${user.account_id}?username=${user.account_username}`}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Message
                  </Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

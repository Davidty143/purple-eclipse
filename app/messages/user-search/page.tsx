// components/messages/user-search.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface User {
  account_id: string;
  account_username: string;
  account_email: string;
}

export function UserSearch({ currentUserId }: { currentUserId: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.from('Account').select('account_id, account_username, account_email').ilike('account_username', `%${searchQuery}%`).neq('account_id', currentUserId).limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {searchQuery && (
        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => (
              <div key={user.account_id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>{user.account_username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm fo  nt-medium">{user.account_username}</p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="text-primary hover:text-primary" asChild>
                  <Link href={`/messages/${user.account_id}`}>
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

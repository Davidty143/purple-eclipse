'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { ThreadData } from '@/types/forum';

interface ThreadRowProps {
  thread: ThreadData;
}

export function ThreadRow({ thread }: ThreadRowProps) {
  const username = thread.author?.account_username || 'User';

  // Get initials from the username
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  };

  // Safe category fallback
  const categoryText = thread.thread_category || 'No category';

  return (
    <Link href={`/thread/${thread.thread_id}`}>
      <div className="flex items-start gap-4 py-3 hover:bg-[#edf4f2] transition-colors cursor-pointer w-full p-5 m-0">
        {/* Avatar Section */}
        <Avatar className="h-12 w-12 flex-shrink-0">{thread.author?.account_avatar_url?.trim() ? <AvatarImage src={thread.author.account_avatar_url} alt={username} /> : <AvatarFallback className="text-xs">{getInitials(username)}</AvatarFallback>}</Avatar>

        {/* Thread Details Section */}
        <div className="flex-1 min-w-0 mt-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs text-muted-foreground bg-[#267858] text-white hover:bg-[#267858] active:bg-[#267858] focus:bg-[#267858]">
              {categoryText}
            </Badge>
            <span className="text-md font-semibold truncate">{thread.thread_title}</span>
          </div>

          {/* Posted by details */}
          <div className="text-xs text-muted-foreground mt-1">
            Posted by {username}
            {' • '}
            {format(new Date(thread.thread_created), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

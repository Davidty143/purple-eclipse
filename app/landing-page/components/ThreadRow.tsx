'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

interface ThreadRowProps {
  thread: {
    thread_id: number;
    thread_title: string;
    thread_created: string;
    thread_category: string | null;
    author: {
      account_username: string | null;
      account_email: string | null;
      account_avatar_url?: string | null;
    };
  };
}

export function ThreadRow({ thread }: ThreadRowProps) {
  const username = thread.author?.account_username || 'Anonymous';
  const categoryText = thread.thread_category || 'Discussion';

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : parts
          .slice(0, 2)
          .map((p) => p.charAt(0).toUpperCase())
          .join('');
  };

  return (
    <Link href={`/thread/${thread.thread_id}`}>
      <div className="flex items-start gap-4 py-3 hover:bg-[#edf4f2] transition-colors cursor-pointer w-full px-5">
        <Avatar className="h-12 w-12 mt-1 flex-shrink-0">
          {thread.author?.account_avatar_url?.trim() ? (
            <AvatarImage src={thread.author.account_avatar_url} alt={username} />
          ) : (
            <AvatarFallback className="text-xs">{getInitials(username)}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0 mt-1.5">
          <div className="flex items-start sm:items-center gap-2 flex-row overflow-hidden">
            <Badge variant="secondary" className="text-xs bg-[#267858] text-white hover:bg-[#267858]">
              {categoryText}
            </Badge>

            <div className="text-sm md:text-base font-semibold text-gray-900 flex-1 min-w-0 overflow-hidden">
              <p className="line-clamp-1 sm:line-clamp-1 break-words">{thread.thread_title}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Posted by {username} • {format(new Date(thread.thread_created), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

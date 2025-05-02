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
  console.log('Rendering thread row:', thread); // Log the thread being rendered

  // Fallback value for avatar if avatar_url is missing
  const avatarUrl = thread.author?.account_avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'user'}`;

  // Safely check for thread_category (handle both string and null cases)
  const categoryText: string = thread.thread_category ? thread.thread_category : 'No category';

  return (
    <Link href={`/thread/${thread.thread_id}`}>
      <div className="flex items-start gap-4 py-3 hover:bg-[#edf4f2] transition-colors cursor-pointer w-full p-5 m-0">
        {/* Avatar Section */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-xs">{thread.author?.account_username ? thread.author.account_username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>

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
            Posted by {thread.author?.account_username || 'Anonymous'}
            {' • '}
            {format(new Date(thread.thread_created), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

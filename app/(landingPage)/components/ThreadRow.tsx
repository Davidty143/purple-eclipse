'use client';
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { ThreadData } from '@/types/forum';

export function ThreadRow({ thread }: { thread: ThreadData }) {
  // Access author data from thread object
  const username = thread.author?.account_username || 'Anonymous';
  const avatarUrl = thread.author?.account_avatar_url || `https://avatar.vercel.sh/${username}`;
  const initial = username.charAt(0).toUpperCase();

  return (
    <Link href={`/thread/${thread.thread_id}`}>
      <div className="flex items-start gap-3 p-3 hover:bg-accent rounded-md transition-colors cursor-pointer">
        {/* Avatar on the leftmost */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {thread.thread_category || 'General'}
            </Badge>
            <span className="text-sm font-semibold truncate">{thread.thread_title}</span>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Posted by {username} • {format(new Date(thread.thread_created), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Link>
  );
}

'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import Link from 'next/link';

interface ThreadRowProps {
  thread: {
    thread_id: number;
    thread_title: string;
    thread_created: string;
    thread_category?: string;
    author: {
      account_username: string | null;
      account_email: string | null;
      account_avatar_url?: string | null;
    };
    comments: { count: number }[];
    subforum?: {
      subforum_id: number;
      subforum_name: string;
    };
  };
}

const ThreadRow = ({ thread }: ThreadRowProps) => {
  // Determine avatar URL - use author's avatar_url if it exists, otherwise use default
  const avatarUrl = thread.author?.account_avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`;

  // Create URL with category if available
  const threadUrl = thread.subforum ? `/category/${thread.subforum.subforum_name.toLowerCase()}/thread/${thread.thread_id}` : `/thread/${thread.thread_id}`;

  return (
    <Link href={threadUrl}>
      <div className="thread-row py-3.5 px-6 flex flex-col hover:bg-gray-50 cursor-pointer">
        <div className="flex items-center space-x-4 justify-between">
          {/* Author Profile */}
          <div className="flex flex-row gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{(thread.author?.account_username || '').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            {/* Thread Details */}
            <div className="flex items-center">
              <div>
                <div className="flex justify-start items-center gap-2">
                  <span className="text-xs font-semibold bg-gray-200 px-4 py-0.5 rounded-sm">{thread.thread_category || 'Discussion'}</span>
                  <h3 className="text-md font-semibold">{thread.thread_title}</h3>
                </div>
                <div className="text-xs text-semibold text-gray-500">
                  <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
                  {' - '}
                  <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Replies Count */}
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {thread.comments[0]?.count || 0} replies
              </span>
              <span className="text-xs text-gray-400">{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ThreadRow;

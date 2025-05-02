'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThreadRow } from './ThreadRow';
import * as Icons from 'lucide-react'; // import all Lucide icons

// Types
export interface ThreadAuthor {
  account_username: string | null;
  account_email: string | null;
  account_avatar_url?: string | null;
}

export interface ThreadData {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  author: ThreadAuthor;
  comments: { count: number }[];
}

export interface SubforumData {
  subforum_id: number;
  subforum_name: string | null;
  subforum_description: string | null;
  subforum_icon?: string | null;
  threads: ThreadData[];
}

export function SubforumBlock({ subforum }: { subforum: SubforumData }) {
  // Get icon dynamically or fall back to a default (e.g., 'MessageSquare')
  const LucideIcon = (Icons[subforum.subforum_icon as keyof typeof Icons] || Icons.MessageSquare) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  return (
    <Card className="w-full border border-gray-300">
      <CardHeader className="px-5 py-4 bg-[#edf4f2] border-b border-gray-300 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-[#267858] rounded">
            <LucideIcon className="w-4 h-4 text-[#edf4f2]" />
          </div>
          <CardTitle className="font-medium text-md">{subforum.subforum_name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 mt-4">{subforum.threads.length > 0 ? subforum.threads.slice(0, 5).map((thread) => <ThreadRow key={thread.thread_id} thread={thread} />) : <div className="py-3 text-center text-muted-foreground">No threads yet</div>}</CardContent>
    </Card>
  );
}

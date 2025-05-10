'use client';
import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
}

export function SidebarThreadRow({ thread }: { thread: Thread }) {
  return (

    <div className="w-full flex items-center gap-3 py-2 px-5 hover:bg-[#edf4f2]  transition-colors cursor-pointer">
      <Avatar className="h-8 w-8">
        <AvatarImage src={thread.author.avatar} />
        <AvatarFallback className="bg-secondary">
          {thread.author.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <p className="text-sm font-medium truncate">{thread.title}</p>
    </div>
  );
}

export function NewTopics({ threads }: { threads: Thread[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedThreads = showAll ? threads : threads.slice(0, 10);
  const hasMore = threads.length > 10;

  return (
    <Card className="w-[300px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg bg-cyan-200">New Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {displayedThreads.map((thread) => (
          <SidebarThreadRow key={thread.id} thread={thread} />
        ))}

        {hasMore && !showAll && (
          <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-accent" onClick={() => setShowAll(true)}>
            Show More (+{threads.length - 10})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

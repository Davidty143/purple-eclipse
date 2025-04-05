// components/NewTopics.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SidebarThreadRow } from './SidebarThreadRow';
import { sidebarMockThreads } from './SideBarMockThreads';

export function NewTopics() {
  const [showAll, setShowAll] = useState(false);
  const displayedThreads = showAll ? sidebarMockThreads : sidebarMockThreads.slice(0, 10);
  const hasMore = sidebarMockThreads.length > 10;

  return (
    <Card className="w-[300px] p-0">
      {' '}
      <CardHeader className="pb-3 px-4 pt-3 border-b bg-gray-50">
        {' '}
        <CardTitle className="text-md text-start font-semibold ">New Topics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-2 pt-3 pb-4">
        {' '}
        {displayedThreads.map((thread) => (
          <SidebarThreadRow key={thread.id} thread={thread} />
        ))}
        {hasMore && !showAll && (
          <Button variant="ghost" size="sm" className="w-full text-primary text-gray-600 hover:underline hover:font-semibold hover:bg-white" onClick={() => setShowAll(true)}>
            Show More (+{sidebarMockThreads.length - 10})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

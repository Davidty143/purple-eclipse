'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SubforumData } from '@/types/forum';
import { ThreadRow } from './ThreadRow';

export function SubforumBlock({ subforum }: { subforum: SubforumData }) {
  return (
    <Card className="w-full border border-gray-300">
      <CardHeader className="px-5 py-4 bg-gray-100 border-b border-gray-300 rounded-t-lg">
        <CardTitle className="font-medium text-md">{subforum.subforum_name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 mt-4">{subforum.threads.length > 0 ? subforum.threads.slice(0, 5).map((thread) => <ThreadRow key={thread.thread_id} thread={thread} />) : <div className="py-3 text-center text-muted-foreground">No threads yet</div>}</CardContent>
    </Card>
  );
}

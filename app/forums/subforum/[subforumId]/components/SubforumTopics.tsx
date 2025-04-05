// app/forums/subforum/[subforumId]/components/SubforumTopics.tsx
'use client';

import { ThreadRow } from './SubforumThreadRow';
import { mockThreads } from './MockThreads';

export function SubforumTopics() {
  return (
    <div className="space-y-4">
      {mockThreads.map((thread) => (
        <ThreadRow key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

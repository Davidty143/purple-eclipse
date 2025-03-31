// components/forum-wrapper.tsx
'use client';

import { ForumTitle } from './ForumTitle';
import { SubforumCard } from './SubforumCard';

interface ForumWrapperProps {
  forumTitle: string;
  subforums: string[];
  showActions?: boolean;
}

export function ForumComponentWrapper({ forumTitle, subforums, showActions = true }: ForumWrapperProps) {
  return (
    <div className="space-y-4">
      <ForumTitle title={forumTitle} showActions={showActions} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {subforums.map((subforum, index) => (
          <SubforumCard key={index} name={subforum} />
        ))}
      </div>
    </div>
  );
}

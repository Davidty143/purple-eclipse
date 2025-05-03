import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Forum } from './types';

interface ForumItemProps {
  forum: Forum;
  onSelect: (subforumId: number, subforumName: string) => void;
}

const ForumItem: React.FC<ForumItemProps> = ({ forum, onSelect }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">{forum.forum_name}</h3>
        </div>
        {forum.forum_description && <p className="text-sm text-gray-600 mt-1 ml-9">{forum.forum_description}</p>}
      </div>
      <div className="divide-y">
        {forum.subforums.map((subforum) => (
          <button key={subforum.subforum_id} onClick={() => onSelect(subforum.subforum_id, subforum.subforum_name)} className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-[#267858]">{subforum.subforum_name}</h4>
              {subforum.subforum_description && <p className="text-sm text-gray-500 mt-0.5">{subforum.subforum_description}</p>}
            </div>
            <div className="text-sm text-gray-500">
              <span className="mr-4">Threads: {subforum.thread_count}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ForumItem;

'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createClient } from '@/app/utils/supabase/client';
import { Loader2, HelpCircle } from 'lucide-react';

// Import all icons from lucide-react
import * as Icons from 'lucide-react';

interface Forum {
  forum_id: number;
  forum_name: string;
  forum_description: string;
  subforums: SubforumWithCounts[];
}

interface Subforum {
  subforum_id: number;
  subforum_name: string;
  subforum_description: string;
  subforum_icon: string | null; // Ensure this is nullable
}

interface SubforumWithCounts extends Subforum {
  thread_count: number;
  post_count: number;
}

interface ForumSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (subforumId: number, subforumName: string) => void;
}

const ForumSelectionModal: React.FC<ForumSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchForums = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch forums
        const { data: forumsData, error: forumsError } = await supabase.from('Forum').select('forum_id, forum_name, forum_description').eq('forum_deleted', false);

        if (forumsError) throw new Error(forumsError.message);

        // Fetch subforums with thread and post counts for each forum
        const forumsWithSubforums = await Promise.all(
          forumsData.map(async (forum) => {
            // First get the subforums, including the icon
            const { data: subforumsData, error: subforumsError } = await supabase.from('Subforum').select('subforum_id, subforum_name, subforum_description, subforum_icon').eq('forum_id', forum.forum_id).eq('subforum_deleted', false);

            if (subforumsError) throw new Error(subforumsError.message);

            // Then get the counts for each subforum
            const subforumsWithCounts = await Promise.all(
              (subforumsData || []).map(async (subforum) => {
                // Get thread count
                const { count: threadCount, error: threadError } = await supabase.from('Thread').select('*', { count: 'exact', head: true }).eq('subforum_id', subforum.subforum_id).eq('thread_deleted', false);

                if (threadError) throw new Error(threadError.message);

                // Get post count (comments)
                const { count: postCount, error: postError } = await supabase.from('Thread').select('*', { count: 'exact', head: true }).eq('subforum_id', subforum.subforum_id).eq('thread_deleted', false);

                if (postError) throw new Error(postError.message);

                return {
                  ...subforum,
                  thread_count: threadCount || 0,
                  post_count: postCount || 0
                };
              })
            );

            return {
              ...forum,
              subforums: subforumsWithCounts
            };
          })
        );

        setForums(forumsWithSubforums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forums');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchForums();
    }
  }, [isOpen, supabase]);

  const handleSubforumSelect = (subforum: SubforumWithCounts) => {
    onSelect(subforum.subforum_id, subforum.subforum_name);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[350px] sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#267858] text-center sm:text-left">Select a Subforum to Post</DialogTitle>
          <DialogDescription>Select a subforum from the list below to post your thread.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {forums.map((forum) => (
                <div key={forum.forum_id} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-[#edf4f2] p-4 border-b border-gray-300">
                    <div className="flex items-center gap-2 sm:gap-6">
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                        {forum.forum_name}
                        <span className="ml-2 text-xs text-white bg-[#267858] rounded-full px-2 py-1">Forum</span>
                      </h3>
                    </div>
                    {forum.forum_description && <p className="text-sm text-gray-600 mt-1">{forum.forum_description}</p>}
                  </div>
                  <div className="divide-y">
                    {forum.subforums.map((subforum) => {
                      const LucideIcon = (Icons[subforum.subforum_icon as keyof typeof Icons] as React.ComponentType<React.SVGProps<SVGSVGElement>>) || HelpCircle;

                      return (
                        <button key={subforum.subforum_id} onClick={() => handleSubforumSelect(subforum)} className="w-full text-left p-4 px-5 hover:bg-[#edf4f2] transition-colors flex items-start justify-between group">
                          <div className="flex justify-start items-start gap-3">
                            <LucideIcon className="h-6 w-6 text-gray-600 group-hover:text-[#267858]" />
                            <div className="flex flex-col">
                              <h4 className="font-medium text-gray-900 group-hover:text-[#267858]">{subforum.subforum_name}</h4>
                              {subforum.subforum_description && <p className="text-sm text-gray-500 mt-1">{subforum.subforum_description}</p>}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="mr-4">Threads: {subforum.thread_count}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForumSelectionModal;

//working

'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import ForumItem from './ForumItem';
import { Forum, ForumSelectionModalProps } from './types';

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
            // First get the subforums
            const { data: subforumsData, error: subforumsError } = await supabase
              .from('Subforum')
              .select(
                `
                subforum_id,
                subforum_name,
                subforum_description
              `
              )
              .eq('forum_id', forum.forum_id)
              .eq('subforum_deleted', false);

            if (subforumsError) throw new Error(subforumsError.message);

            // Then get the counts for each subforum
            const subforumsWithCounts = await Promise.all(
              (subforumsData || []).map(async (subforum) => {
                // Get thread count
                const { count: threadCount, error: threadError } = await supabase.from('Thread').select('*', { count: 'exact', head: true }).eq('subforum_id', subforum.subforum_id).eq('thread_deleted', false);

                if (threadError) throw new Error(threadError.message);

                // Get post count (comments)
                const { count: postCount, error: postError } = await supabase.from('Post').select('*', { count: 'exact', head: true }).eq('subforum_id', subforum.subforum_id).eq('post_deleted', false);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select a Forum</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {forums.map((forum) => (
                <ForumItem key={forum.forum_id} forum={forum} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForumSelectionModal;

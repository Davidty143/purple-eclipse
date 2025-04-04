// app/post-thread/components/PostThread.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThreadForm from '@/components/thread/ThreadForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import ForumSelectionModal from '@/components/thread/ForumSelectionModal';

const PostThread = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = createClient();
  const [showForumModal, setShowForumModal] = useState(true);
  const [selectedSubforumId, setSelectedSubforumId] = useState<number | null>(null);
  const [selectedSubforumName, setSelectedSubforumName] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const handleForumSelect = (subforumId: number, subforumName: string) => {
    setSelectedSubforumId(subforumId);
    setSelectedSubforumName(subforumName);
    setShowForumModal(false);
  };

  const handleModalClose = () => {
    setShowForumModal(false);
  };

  const handleCancel = () => {
    router.push('/');
  };

  const handleSubmit = async (formData: { category: string; title: string; content: string }) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to create a thread');
      }

      if (!selectedSubforumId) {
        setShowForumModal(true);
        return;
      }

      // First create the thread in the threads table
      const { data: threadData, error: threadError } = await supabase
        .from('Thread')
        .insert([
          {
            thread_title: formData.title,
            thread_content: formData.content,
            subforum_id: selectedSubforumId,
            thread_deleted: false,
            thread_created: new Date().toISOString(),
            thread_modified: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (threadError) {
        throw new Error(threadError.message);
      }

      console.log('Thread created:', threadData);
      router.push('/'); // Redirect to home page after posting
    } catch (error) {
      console.error('Error posting thread:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ForumSelectionModal isOpen={showForumModal} onClose={handleModalClose} onSelect={handleForumSelect} />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create New Thread</h1>
                {selectedSubforumName && <p className="text-sm text-gray-500 mt-1">Posting in: {selectedSubforumName}</p>}
                {!selectedSubforumId && !showForumModal && <p className="text-sm text-red-500 mt-1">Please select a forum to post in</p>}
              </div>
              <Button type="button" variant="ghost" onClick={handleCancel} className="text-gray-500 hover:text-red-300">
                Cancel
              </Button>
            </div>
            <ThreadForm onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostThread;

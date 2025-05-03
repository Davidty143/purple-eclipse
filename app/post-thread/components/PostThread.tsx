'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThreadForm from '@/components/thread/ThreadForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { createClient } from '@/utils/supabase/client';
import ForumSelectionModal from '@/components/thread/ForumSelectionModal';
import { v4 as uuidv4 } from 'uuid';

interface ThreadImage {
  url: string;
  path: string;
}

const PostThread = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const [showForumModal, setShowForumModal] = useState(true);
  const [selectedSubforumId, setSelectedSubforumId] = useState<number | null>(null);
  const [selectedSubforumName, setSelectedSubforumName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Handle forum selection
  const handleForumSelect = (subforumId: number, subforumName: string) => {
    setSelectedSubforumId(subforumId);
    setSelectedSubforumName(subforumName);
    setShowForumModal(false);
  };

  // Close the forum selection modal
  const handleModalClose = () => setShowForumModal(false);

  // Handle image upload
  const uploadImages = async (images: File[]): Promise<ThreadImage[]> => {
    const uploadedImages: ThreadImage[] = [];
    const imagesToCleanup: string[] = [];

    try {
      for (const image of images) {
        if (!image.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${image.name}`);
          continue;
        }

        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `thread-images/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('thread-images').upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

        if (uploadError) {
          throw new Error(`Error uploading image ${image.name}: ${uploadError.message}`);
        }

        imagesToCleanup.push(filePath);

        const {
          data: { publicUrl }
        } = supabase.storage.from('thread-images').getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error(`Failed to get public URL for ${filePath}`);
        }

        uploadedImages.push({ url: publicUrl, path: filePath });
      }

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading images:', error);

      if (imagesToCleanup.length > 0) {
        await supabase.storage.from('thread-images').remove(imagesToCleanup);
      }

      throw error;
    }
  };

  // Handle form submission for creating a thread
  const handleSubmit = async (formData: { category: string; title: string; content: string; images: File[] }) => {
    try {
      setErrorMessage(null);
      setIsProcessing(true);

      if (!user) throw new Error('You must be logged in to create a thread');
      if (!selectedSubforumId) {
        setShowForumModal(true);
        setIsProcessing(false);
        return;
      }

      if (!user.id) throw new Error('User ID is missing');

      // Check if user exists in Account table, if not, create a new account
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      if (accountError || !accountData) {
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false,
          account_avatar_url: avatarUrl
        });

        if (createAccountError) throw new Error(`Account creation failed: ${createAccountError.message}`);
      }

      // Upload images if any
      let uploadedImages: ThreadImage[] = [];
      if (formData.images.length > 0) {
        uploadedImages = await uploadImages(formData.images);
      }

      // Create thread record
      const { data: threadData, error: threadError } = await supabase
        .from('Thread')
        .insert([
          {
            thread_title: formData.title,
            thread_content: formData.content,
            thread_category: formData.category, // Add this line
            subforum_id: selectedSubforumId,
            thread_deleted: false,
            thread_created: new Date().toISOString(),
            thread_modified: new Date().toISOString(),
            author_id: user.id
          }
        ])
        .select()
        .single();

      if (threadError) throw new Error(threadError.message);

      // Insert thread images if any
      if (uploadedImages.length > 0) {
        const imageInsertData = uploadedImages.map((image) => ({
          thread_id: threadData.thread_id,
          image_url: image.url,
          storage_path: image.path,
          created_at: new Date().toISOString()
        }));

        const { error: imageError } = await supabase.from('thread_image').insert(imageInsertData);

        if (imageError) {
          await Promise.all(uploadedImages.map((image) => supabase.storage.from('thread-images').remove([image.path])));
          throw new Error(`Failed to save image records: ${imageError.message}`);
        }
      }

      router.push('/'); // Redirect to home page after thread creation
    } catch (error) {
      console.error('Error posting thread:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create thread. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ForumSelectionModal isOpen={showForumModal} onClose={handleModalClose} onSelect={handleForumSelect} />

      <div className="min-h-screen">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-md border-gray-300 shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Create New Thread</h1>
                {selectedSubforumName && (
                  <div className="flex items-center space-x-4 mt-3">
                    <p className="text-sm text-gray-600 font-semibold">
                      Posting in: <span className="text-white bg-[#267858] ml-1 px-3 py-1.5 rounded-md">{selectedSubforumName}</span>
                    </p>
                    <span onClick={() => setShowForumModal(true)} className="text-sm text-[#267858] underline cursor-pointer hover:font-semibold">
                      Change
                    </span>
                  </div>
                )}
                {!selectedSubforumId && !showForumModal && (
                  <div>
                    <p className="text-sm text-red-500 mt-1">Please select a forum to post in</p>
                    <Button type="button" variant="outline" onClick={() => setShowForumModal(true)} className="mt-2 text-[#267858] hover:text-[#267858] border border-gray-300 hover:font-semibold">
                      Select Forum
                    </Button>
                  </div>
                )}
                {errorMessage && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
              </div>
            </div>
            <ThreadForm onSubmit={handleSubmit} isSubmitting={isProcessing} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostThread;

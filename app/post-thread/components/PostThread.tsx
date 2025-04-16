// app/post-thread/components/PostThread.tsx
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

  const uploadImages = async (images: File[]): Promise<ThreadImage[]> => {
    const uploadedImages: ThreadImage[] = [];
    const imagesToCleanup: string[] = [];

    try {
      for (const image of images) {
        // Validate image
        if (!image.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${image.name} (${image.type})`);
          continue;
        }

        // Generate unique file name
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `thread-images/${fileName}`;

        console.log(`Uploading image: ${image.name} (${image.size} bytes) to ${filePath}`);

        // Upload to storage
        const { error: uploadError } = await supabase.storage.from('thread-images').upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error(`Error uploading image ${image.name}: ${uploadError.message}`);
        }

        // Track path for cleanup in case of error
        imagesToCleanup.push(filePath);

        // Get public URL
        const {
          data: { publicUrl }
        } = supabase.storage.from('thread-images').getPublicUrl(filePath);

        if (!publicUrl) {
          throw new Error(`Failed to get public URL for ${filePath}`);
        }

        // Add to successful uploads
        uploadedImages.push({
          url: publicUrl,
          path: filePath
        });

        console.log(`Image uploaded successfully: ${filePath} -> ${publicUrl}`);
      }

      console.log(`Successfully uploaded ${uploadedImages.length} of ${images.length} images`);
      return uploadedImages;
    } catch (error) {
      console.error('Error in uploadImages:', error);

      // Clean up any images that were uploaded before the error
      if (imagesToCleanup.length > 0) {
        console.log(`Cleaning up ${imagesToCleanup.length} uploaded images due to error`);
        try {
          await supabase.storage.from('thread-images').remove(imagesToCleanup);
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }

      throw error;
    }
  };

  const handleSubmit = async (formData: { category: string; title: string; content: string; images: File[] }) => {
    try {
      // Reset error state
      setErrorMessage(null);

      // Set processing state to true to disable the form
      setIsProcessing(true);

      if (!user) {
        throw new Error('You must be logged in to create a thread');
      }

      if (!selectedSubforumId) {
        setShowForumModal(true);
        setIsProcessing(false);
        return;
      }

      if (!user.id) {
        throw new Error('User ID is missing');
      }

      // First check if the account exists in the Account table
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      // If the account doesn't exist, create one
      if (accountError || !accountData) {
        console.log('Account not found, creating new account');
        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false
        });

        if (createAccountError) {
          console.error('Error creating account:', createAccountError);
          throw new Error(`Account creation failed: ${createAccountError.message}`);
        }
      }

      // Upload images first if any and wait for all uploads to complete
      let uploadedImages: ThreadImage[] = [];
      if (formData.images && formData.images.length > 0) {
        console.log(`Uploading ${formData.images.length} images...`);
        uploadedImages = await uploadImages(formData.images);
        console.log('Images uploaded successfully:', uploadedImages);
      }

      console.log('Creating thread...');
      // Create the thread in the threads table
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

      // If we have images, create entries in the ThreadImage table
      if (uploadedImages.length > 0) {
        console.log(`Creating ${uploadedImages.length} thread image records...`);

        const imageInsertData = uploadedImages.map((image) => ({
          thread_id: threadData.thread_id,
          image_url: image.url,
          storage_path: image.path,
          created_at: new Date().toISOString()
        }));

        const { error: imageError } = await supabase.from('thread_image').insert(imageInsertData);

        if (imageError) {
          console.error('Error inserting image records:', imageError);
          // If there's an error inserting image records, delete the uploaded images
          await Promise.all(uploadedImages.map((image) => supabase.storage.from('thread-images').remove([image.path])));
          throw new Error(`Failed to save image records: ${imageError.message}`);
        }
      }

      console.log('Thread created successfully:', threadData);
      router.push('/'); // Redirect to home page after posting
    } catch (error) {
      console.error('Error posting thread:', error);
      // Set error message to display to the user
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

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create New Thread</h1>
                {selectedSubforumName && <p className="text-sm text-gray-500 mt-1">Posting in: {selectedSubforumName}</p>}
                {!selectedSubforumId && !showForumModal && <p className="text-sm text-red-500 mt-1">Please select a forum to post in</p>}
                {errorMessage && <p className="text-sm text-red-500 mt-1">{errorMessage}</p>}
              </div>
              <Button type="button" variant="ghost" onClick={handleCancel} className="text-gray-500 hover:text-red-300">
                Cancel
              </Button>
            </div>
            <ThreadForm onSubmit={handleSubmit} isSubmitting={isProcessing} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostThread;

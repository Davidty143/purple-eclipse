import { Editor } from '@tiptap/react';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const handleImageUpload = async (file: File): Promise<ImageUploadResult> => {
  try {
    // First get a presigned URL for the upload
    const presignedResponse = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: file.type,
        size: file.size
      })
    });

    if (!presignedResponse.ok) {
      const error = await presignedResponse.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { uploadUrl, publicUrl } = await presignedResponse.json();

    // Upload the file directly to storage using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const insertImage = async (editor: Editor | null, file: File, onError?: (error: string) => void) => {
  if (!editor || !file) return;

  if (!file.type.startsWith('image/')) {
    onError?.('Please select an image file');
    return;
  }

  try {
    // Upload the image first
    const { success, url, error } = await handleImageUpload(file);

    if (!success || !url) {
      throw new Error(error || 'Failed to upload image');
    }

    // Only insert the image after successful upload
    editor.chain().focus().setImage({ src: url }).run();
  } catch (error) {
    onError?.(error instanceof Error ? error.message : 'Failed to upload image');
    console.error('Error inserting image:', error);
  }
};

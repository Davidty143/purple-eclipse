// app/post-thread/components/ThreadForm.tsx
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateForm, FormErrors } from '@/utils/thread/formUtils';
import RichTextEditor from '@/components/ui/rich-editor-text';
import Image from 'next/image';

interface ThreadFormProps {
  onSubmit: (formData: { category: string; title: string; content: string; images: File[] }) => Promise<void>;
  isSubmitting?: boolean;
}

const ThreadForm: React.FC<ThreadFormProps> = ({ onSubmit, isSubmitting: externalIsSubmitting }) => {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });

  // Use either the external isSubmitting state or the internal one
  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const handleImagesSelected = (files: File[]) => {
    // Filter out duplicates based on file name and size
    const newImages = files.filter((newFile) => {
      return !selectedImages.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size);
    });

    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, setErrors)) {
      return;
    }

    if (!externalIsSubmitting) {
      setInternalIsSubmitting(true);
    }

    try {
      await onSubmit({
        ...formData,
        images: selectedImages
      });
    } catch (error) {
      console.error('Error posting thread:', error);
      setErrors({ submit: 'Failed to create thread. Please try again.' });
    } finally {
      if (!externalIsSubmitting) {
        setInternalIsSubmitting(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select name="category" value={formData.category} onChange={handleChange} className={cn('w-full p-2 border rounded-lg', errors.category ? 'border-red-500' : 'border-gray-300')} required>
          <option value="">Select a category</option>
          <option value="Help">Help</option>
          <option value="Discussion">Discussion</option>
          <option value="Question">Question</option>
          <option value="Tutorial">Tutorial</option>
          <option value="News">News</option>
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <Input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter a descriptive title" className={cn('w-full', errors.title ? 'border-red-500' : 'border-gray-300')} required />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Content Field with integrated image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor value={formData.content} onChange={handleContentChange} placeholder="Write your thread content here..." className={errors.content ? 'border-red-500' : ''} onImagesSelected={handleImagesSelected} />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}

        {/* Image preview section */}
        {selectedImages.length > 0 && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Selected Images ({selectedImages.length})</h3>
              <Button type="button" variant="outline" size="sm" onClick={clearAllImages} className="text-xs text-red-500 border-red-200 hover:bg-red-50">
                Clear All
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              {selectedImages.map((image, index) => (
                <div key={`${image.name}-${index}`} className="relative">
                  <div className="w-24 h-24 overflow-hidden rounded-lg border border-gray-200 shadow-sm bg-white relative">
                    <Image src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  </div>
                  <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm" aria-label="Remove image">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end items-center space-x-4 mt-6">
        {errors.submit && <p className="text-sm text-red-500 mr-auto">{errors.submit}</p>}
        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 min-w-[100px]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...
            </>
          ) : (
            'Post Thread'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ThreadForm;

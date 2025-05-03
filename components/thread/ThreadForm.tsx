'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, X, Type, Tag, ChevronDown } from 'lucide-react';
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

  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  const handleImagesSelected = (files: File[]) => {
    const newImages = files.filter((newFile) => !selectedImages.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size));
    if (newImages.length > 0) setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData, setErrors)) return;

    if (!externalIsSubmitting) setInternalIsSubmitting(true);

    try {
      await onSubmit({ ...formData, images: selectedImages });
    } catch (error) {
      console.error('Error posting thread:', error);
      setErrors({ submit: 'Failed to create thread. Please try again.' });
    } finally {
      if (!externalIsSubmitting) setInternalIsSubmitting(false);
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
      {/* Category Field with Tag Icon inside the Select dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className={cn('transition-all', errors.category && 'ring-2 ring-red-500 rounded-md')}>
          <Select
            value={formData.category}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, category: value }));
              if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
            }}>
            <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:ring-2 focus:ring-[#267858] focus:outline-none flex items-center justify-start">
              {/* Tag Icon inside the Select Trigger */}
              <Tag className="text-gray-400 w-5 h-5 mr-3" />
              <SelectValue placeholder="Select a category" className="text-left" />
              {/* Chevron Icon on the rightmost */}
              <ChevronDown className="ml-auto text-white w-5 h-5" />
            </SelectTrigger>
            <SelectContent className="text-left px-3">
              <SelectItem value="Help" className="text-left">
                Help
              </SelectItem>
              <SelectItem value="Discussion" className="text-left">
                Discussion
              </SelectItem>
              <SelectItem value="Question" className="text-left">
                Question
              </SelectItem>
              <SelectItem value="Tutorial" className="text-left">
                Tutorial
              </SelectItem>
              <SelectItem value="News" className="text-left">
                News
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>

      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <div className={cn('flex items-center gap-3 h-12 border rounded-md border-gray-300 px-4 bg-white transition', 'focus-within:ring-2 focus-within:ring-[#267858]', errors.title && 'border-red-500')}>
          <Type className="text-gray-400 w-5 h-5" />
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter a descriptive title" className="flex-1 bg-transparent outline-none text-sm text-gray-700" required />
        </div>
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Content Field with RichTextEditor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor value={formData.content} onChange={handleContentChange} placeholder="Write your thread content here..." className={errors.content ? 'border-red-500' : ''} onImagesSelected={handleImagesSelected} />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}

        {/* Image Preview */}
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
        <Button type="submit" className="bg-[#267858] text-white hover:bg-[#1f5e4a] min-w-[100px]" disabled={isSubmitting}>
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

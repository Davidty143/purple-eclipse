'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Loader2, X, Type, Tag, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateForm, FormErrors } from '@/utils/thread/formUtils';
import RichTextEditor from '@/components/ui/rich-editor-text';
import Image from 'next/image';
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ThreadFormProps {
  onSubmit: (data: { category: string; title: string; content: string; images: File[] }) => Promise<void>;
  isSubmitting?: boolean;
}

const MAX_TITLE_LENGTH = 60;

const ThreadForm: React.FC<ThreadFormProps> = ({ onSubmit, isSubmitting: externalIsSubmitting }) => {
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });

  const isSubmitting = externalIsSubmitting !== undefined ? externalIsSubmitting : internalIsSubmitting;

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        const supabase = createClient();
        const { data } = await supabase.from('Account').select('account_status').eq('account_id', user.id).single();

        if (data) {
          setUserStatus(data.account_status);
          if (data.account_status === 'BANNED') {
            window.location.href = '/banned';
          }
        }
      }
    };

    checkUserStatus();
  }, [user]);

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

    if (userStatus === 'RESTRICTED' || userStatus === 'BANNED') {
      if (userStatus === 'BANNED') {
        window.location.href = '/banned';
      }
      return;
    }

    if (!validateForm(formData, setErrors)) return;

    if (!externalIsSubmitting) setInternalIsSubmitting(true);

    try {
      await onSubmit({ ...formData, images: selectedImages });
    } catch (error) {
      setErrors({ submit: 'Failed to create thread. Please try again.' });
    } finally {
      if (!externalIsSubmitting) setInternalIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length > MAX_TITLE_LENGTH) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  if (userStatus === 'RESTRICTED') {
    return (
      <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-yellow-700 text-lg">Your account is currently restricted. You cannot create new threads at this time.</p>
      </div>
    );
  }

  if (userStatus === 'BANNED') {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 text-lg">Your account has been banned. You cannot create new threads.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Field */}
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
              <Tag className="text-gray-400 w-5 h-5 mr-3" />
              <SelectValue placeholder="Select a category" className="text-left" />
              <ChevronDown className="ml-auto text-white w-5 h-5" />
            </SelectTrigger>
            <SelectContent className="text-left px-3">
              <SelectItem value="Help">Help</SelectItem>
              <SelectItem value="Discussion">Discussion</SelectItem>
              <SelectItem value="Question">Question</SelectItem>
              <SelectItem value="Tutorial">Tutorial</SelectItem>
              <SelectItem value="News">News</SelectItem>
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
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Enter a descriptive title" maxLength={MAX_TITLE_LENGTH} className="flex-1 bg-transparent outline-none text-sm text-gray-700" required />
        </div>
        <div className="flex justify-between text-xs mt-1">
          {errors.title && <p className="text-red-500">{errors.title}</p>}
          <p className={formData.title.length >= MAX_TITLE_LENGTH * 0.9 ? 'text-red-500' : 'text-gray-500'}>
            {formData.title.length}/{MAX_TITLE_LENGTH}
          </p>
        </div>
      </div>

      {/* Content Field */}
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
      <div className="flex justify-end">
        {errors.submit && <p className="text-sm text-red-500 mr-auto">{errors.submit}</p>}
        <Button type="submit" className="bg-[#267858] text-white hover:bg-[#1f5e4a] min-w-[100px]" disabled={isSubmitting || userStatus === 'RESTRICTED' || userStatus === 'BANNED'}>
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

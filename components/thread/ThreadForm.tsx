// app/post-thread/components/ThreadForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateForm, FormErrors } from '@/utils/thread/formUtils';
import RichTextEditor from '@/components/ui/rich-editor-text';

interface ThreadFormProps {
  onSubmit: (formData: { category: string; title: string; content: string }) => Promise<void>;
}

const ThreadForm: React.FC<ThreadFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, setErrors)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error posting thread:', error);
      setErrors({ submit: 'Failed to create thread. Please try again.' });
    } finally {
      setIsSubmitting(false);
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

      {/* Content Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <RichTextEditor value={formData.content} onChange={handleContentChange} placeholder="Write your thread content here..." className={errors.content ? 'border-red-500' : ''} />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
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

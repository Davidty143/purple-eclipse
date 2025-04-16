// app/post-thread/components/formUtils.ts
export interface FormErrors {
  category?: string;
  title?: string;
  content?: string;
  submit?: string;
}

export const validateForm = (formData: { category: string; title: string; content: string }, setErrors: React.Dispatch<React.SetStateAction<FormErrors>>): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.category) {
    newErrors.category = 'Please select a category';
  }

  if (!formData.title.trim()) {
    newErrors.title = 'Please enter a title';
  } else if (formData.title.length < 3) {
    newErrors.title = 'Title must be at least 3 characters long';
  } else if (formData.title.length > 100) {
    newErrors.title = 'Title must be less than 100 characters';
  }

  if (!formData.content.trim()) {
    newErrors.content = 'Please enter some content';
  } else if (formData.content.length < 10) {
    newErrors.content = 'Content must be at least 10 characters long';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

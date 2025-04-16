'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from '../editor/toolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImagesSelected?: (files: File[]) => void;
}

const RichTextEditor = ({ value, onChange, placeholder = 'Write your content here...', className, onImagesSelected }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto my-4',
          style: 'max-height: 400px; object-fit: contain;'
        },
        allowBase64: true,
        inline: false
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg max-w-none w-full min-h-[200px] focus:outline-none'
      }
    },
    enableInputRules: true,
    enablePasteRules: true,
    immediatelyRender: false
  });

  const handleImageClick = () => {
    // Reset any previous errors
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      setError(null);

      // If onImagesSelected is provided, pass files to parent component
      if (onImagesSelected) {
        onImagesSelected(files);
      }

      // Don't insert the image into the editor, just let the parent component handle it
    } catch (error) {
      console.error('Error handling file upload:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while selecting the image');
    } finally {
      // Reset the file input to allow selecting the same files again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  // Auto-resize the editor based on content
  useEffect(() => {
    if (editor) {
      const updateHeight = () => {
        const editorElement = editor.view.dom;
        const contentHeight = editorElement.scrollHeight;
        const minHeight = 200;
        const maxHeight = 600;

        const newHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
        editorElement.style.height = `${newHeight}px`;
      };

      editor.on('update', updateHeight);
      updateHeight();

      return () => {
        editor.off('update', updateHeight);
      };
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('relative border rounded-lg overflow-hidden flex flex-col w-full', className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />

      <EditorToolbar editor={editor} onImageClick={handleImageClick} onLinkClick={setLink} />

      {error && <div className="bg-red-50 text-red-600 px-4 py-2 text-sm">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className={cn('w-full p-4', 'prose-headings:font-semibold prose-headings:tracking-tight', 'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline', 'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic', 'prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-[80%] prose-img:mx-auto prose-img:my-4 prose-img:block', 'min-h-[200px] max-h-[600px] overflow-y-auto')} />
      </div>
    </div>
  );
};

export default RichTextEditor;

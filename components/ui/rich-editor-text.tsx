'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { EditorToolbar } from '../editor/toolbar';
import LinkModal from '../editor/link-modal';

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
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [initialLinkUrl, setInitialLinkUrl] = useState('');
  const [initialLinkText, setInitialLinkText] = useState('');
  const [hasTextSelection, setHasTextSelection] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false, // Disable default bulletList as we'll use the separate extension
        orderedList: false, // Disable default orderedList as we'll use the separate extension
        blockquote: false // Disable default blockquote as we'll use the separate extension
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc pl-5'
        }
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal pl-5'
        }
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic bg-gray-50 py-2 my-4 rounded-r'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#267858] hover:text-[#267858] underline',
          rel: 'noopener noreferrer',
          target: '_blank'
        },
        autolink: true,
        linkOnPaste: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
        validate: (href) => !!href
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

  // Helper for toggling blockquote
  const toggleBlockquote = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run();
    }
  }, [editor]);

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

  const openLinkModal = useCallback(() => {
    if (!editor) return;

    // Check if we have text selected
    const hasSelection = !editor.state.selection.empty;
    setHasTextSelection(hasSelection);

    // Get selected text if any
    let selectedText = '';
    if (hasSelection) {
      selectedText = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
    }
    setInitialLinkText(selectedText);

    // If there's already a link, get its URL
    const previousUrl = editor.getAttributes('link').href || '';
    setInitialLinkUrl(previousUrl);

    // Open the modal
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(
    (text: string, url: string) => {
      if (!editor) return;

      // Format URL if needed
      let formattedUrl = url;
      if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
        formattedUrl = `https://${url}`;
      }

      if (hasTextSelection) {
        // Update the link for selected text
        editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
      } else {
        // Insert new text with link
        editor.chain().focus().insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-[#267858] hover:text-[#267858] underline">${text}</a>`).run();
      }
    },
    [editor, hasTextSelection]
  );

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

  // Add keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcut for blockquote: Shift+Alt+Q
      if (e.shiftKey && e.altKey && e.key === 'Q') {
        e.preventDefault();
        toggleBlockquote();
      }

      // Keyboard shortcut for link: Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openLinkModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toggleBlockquote, openLinkModal]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('relative border rounded-lg overflow-hidden flex flex-col w-full', className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />

      <EditorToolbar editor={editor} onImageClick={handleImageClick} onLinkClick={openLinkModal} />

      {error && <div className="bg-red-50 text-red-600 px-4 py-2 text-sm">{error}</div>}

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className={cn('w-full p-4', 'prose-headings:font-semibold prose-headings:tracking-tight', 'prose-a:text-[#267858] prose-a:no-underline hover:prose-a:underline', 'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:rounded-r', 'prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-[80%] prose-img:mx-auto prose-img:my-4 prose-img:block', 'prose-ul:list-disc prose-ul:pl-5', 'prose-ol:list-decimal prose-ol:pl-5', 'min-h-[200px] max-h-[600px] overflow-y-auto')} />
      </div>

      <LinkModal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} onSubmit={handleLinkSubmit} initialText={initialLinkText} initialUrl={initialLinkUrl} hasTextSelection={hasTextSelection} />
    </div>
  );
};

export default RichTextEditor;

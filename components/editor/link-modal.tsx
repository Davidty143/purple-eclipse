import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, url: string) => void;
  initialText?: string;
  initialUrl?: string;
  hasTextSelection?: boolean;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSubmit, initialText = '', initialUrl = '', hasTextSelection = false }) => {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const modalRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl(initialUrl);

      // Focus the appropriate field when modal opens
      setTimeout(() => {
        if (hasTextSelection) {
          urlInputRef.current?.focus();
        } else {
          textInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, initialText, initialUrl, hasTextSelection]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!url) {
      urlInputRef.current?.focus();
      return;
    }

    // If text is empty but we have a URL, use the URL as text
    const finalText = text || url;
    onSubmit(finalText, url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Insert Link</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <X size={20} />
          </button>
        </div>

        <div>
          {!hasTextSelection && (
            <div className="mb-4">
              <label htmlFor="link-text" className="block text-sm font-medium text-gray-700 mb-1">
                Link Text
              </label>
              <input
                ref={textInputRef}
                type="text"
                id="link-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit();
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#267858] focus:border-[#267858]"
                placeholder="Text to display"
              />
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              ref={urlInputRef}
              type="text"
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#267858] focus:border-[#267858]"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#267858]">
              Cancel
            </button>
            <button type="button" onClick={() => handleSubmit()} className="px-4 py-2 text-sm font-medium text-white bg-[#267858] border border-transparent rounded-md hover:bg-[#267858] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#267858]">
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;

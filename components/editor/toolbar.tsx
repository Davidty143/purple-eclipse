import { Editor } from '@tiptap/react';
import React from 'react';
import { ToolbarButton, ToolbarDivider } from './toolbar-button';
import { BoldIcon, ItalicIcon, StrikeIcon, BulletListIcon, OrderedListIcon, QuoteIcon, HorizontalRuleIcon, ImageIcon, LinkIcon } from './toolbar-icons';

interface EditorToolbarProps {
  editor: Editor;
  onImageClick: () => void;
  onLinkClick: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onImageClick, onLinkClick }) => {
  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1 items-center">
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <BoldIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <ItalicIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
          <StrikeIcon />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <BulletListIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <OrderedListIcon />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <QuoteIcon />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      <div className="flex items-center gap-1">
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <HorizontalRuleIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onImageClick} title="Upload Image">
          <ImageIcon />
        </ToolbarButton>
        <ToolbarButton onClick={onLinkClick} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon />
        </ToolbarButton>
      </div>
    </div>
  );
};

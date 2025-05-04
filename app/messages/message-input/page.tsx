// components/messages/message-input.tsx
'use client';

import { useActionState } from 'react';
import { sendMessage } from '@/lib/message-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTransition } from 'react';

type MessageState = {
  error?: string | null;
  success?: boolean | null;
};

interface MessageInputProps {
  receiverId: string;
  currentUserId: string;
  setMessages: React.Dispatch<
    React.SetStateAction<
      Array<{
        id: string;
        content: string;
        created_at: string;
        sender_id: string;
        receiver_id: string;
        is_read: boolean;
      }>
    >
  >;
}

export default function MessageInput({ receiverId, currentUserId, setMessages }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [state, action, isPending] = useActionState<MessageState, FormData>(sendMessage, { error: null, success: null });
  const [isPendingTransition, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const messageContent = formData.get('content')?.toString() || '';

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        content: messageContent,
        sender_id: currentUserId,
        receiver_id: receiverId,
        created_at: new Date().toISOString(),
        is_read: false
      }
    ]);

    setContent('');

    startTransition(async () => {
      const result = action(formData);
      if (result?.['error']) {
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      }
    });
  };

  return (
    <form action={handleSubmit} className="flex gap-2 p-4">
      <input type="hidden" name="receiverId" value={receiverId} />
      <Input name="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type a message..." required minLength={1} disabled={isPending || isPendingTransition} />
      <Button
        type="submit"
        size="icon"
        disabled={isPending || isPendingTransition || !content.trim()}
        className={`
          ${!(isPending || isPendingTransition || !content.trim()) ? 'bg-[#267858] hover:bg-[#1e6046] text-white' : 'opacity-50 cursor-not-allowed'}
          transition-colors duration-200
        `}>
        <Send className="h-4 w-4" />
      </Button>
      {state?.['error'] && <p className="text-sm text-red-500">{state['error']}</p>} {/* Use bracket notation for 'error' */}
    </form>
  );
}

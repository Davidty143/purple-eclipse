// lib/message-actions.ts
'use server';

import { createClientForServer } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type MessageState = {
  error?: string | null;
  success?: boolean | null;
};

export async function sendMessage(prevState: MessageState, formData: FormData): Promise<MessageState> {
  const supabase = await createClientForServer();

  try {
    const content = formData.get('content')?.toString().trim();
    const receiverId = formData.get('receiverId')?.toString().trim();

    if (!content) {
      return { error: 'Message content is required', success: false };
    }
    if (!receiverId) {
      return { error: 'Recipient is required', success: false };
    }

    // Get current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Not authenticated', success: false };
    }

    // Insert message
    const { error } = await supabase.from('direct_messages').insert({
      content,
      sender_id: user.id,
      receiver_id: receiverId
    });

    if (error) {
      return { error: 'Failed to send message', success: false };
    }

    revalidatePath(`/messages/${receiverId}`);
    return { success: true, error: null };
  } catch (error) {
    return { error: 'An unexpected error occurred', success: false };
  }
}

export async function getConversation(otherUserId: string) {
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` + `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error('Failed to load conversation');
    }

    return { messages: messages || [], error: null };
  } catch (error) {
    return { messages: [], error: 'An unexpected error occurred' };
  }
}

export async function markAsRead(messageId: string) {
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Not authenticated' };
    }

    const { data: message, error: updateError } = await supabase.from('direct_messages').update({ is_read: true }).eq('id', messageId).eq('receiver_id', user.id).select().single();

    if (updateError) {
      return { error: 'Failed to mark as read' };
    }

    revalidatePath('/messages');
    return { success: true, message };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Not authenticated' };
    }

    // Verify user owns the message
    const { data: message, error: fetchError } = await supabase.from('direct_messages').select('sender_id').eq('id', messageId).single();

    if (fetchError || !message) {
      return { error: 'Message not found' };
    }

    if (message.sender_id !== user.id) {
      return { error: 'Not authorized' };
    }

    const { error: deleteError } = await supabase.from('direct_messages').delete().eq('id', messageId);

    if (deleteError) {
      return { error: 'Failed to delete message' };
    }

    revalidatePath('/messages');
    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred' };
  }
}

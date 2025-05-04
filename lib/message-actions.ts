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
  console.log('Fetching conversation with:', otherUserId);
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      throw new Error('Not authenticated');
    }

    console.log('Querying messages...');
    const { data: messages, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` + `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error.message);
      throw new Error('Failed to load conversation');
    }

    console.log(`Found ${messages?.length || 0} messages`);
    return { messages: messages || [], error: null };
  } catch (error) {
    console.error('Unexpected error in getConversation:', error);
    return { messages: [], error: 'An unexpected error occurred' };
  }
}

export async function markAsRead(messageId: string) {
  console.log('Marking message as read:', messageId);
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return { error: 'Not authenticated' };
    }

    console.log('Updating read status...');
    const { data: message, error: updateError } = await supabase.from('direct_messages').update({ is_read: true }).eq('id', messageId).eq('receiver_id', user.id).select().single();

    if (updateError) {
      console.error('Update failed:', updateError.message);
      return { error: 'Failed to mark as read' };
    }

    console.log('Message marked as read:', messageId);
    revalidatePath('/messages');
    return { success: true, message };
  } catch (error) {
    console.error('Unexpected error in markAsRead:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteMessage(messageId: string) {
  console.log('Attempting to delete message:', messageId);
  const supabase = await createClientForServer();

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return { error: 'Not authenticated' };
    }

    // Verify user owns the message
    console.log('Verifying message ownership...');
    const { data: message, error: fetchError } = await supabase.from('direct_messages').select('sender_id').eq('id', messageId).single();

    if (fetchError || !message) {
      console.error('Message lookup failed:', fetchError?.message);
      return { error: 'Message not found' };
    }

    if (message.sender_id !== user.id) {
      console.error('Unauthorized deletion attempt');
      return { error: 'Not authorized' };
    }

    console.log('Deleting message...');
    const { error: deleteError } = await supabase.from('direct_messages').delete().eq('id', messageId);

    if (deleteError) {
      console.error('Deletion failed:', deleteError.message);
      return { error: 'Failed to delete message' };
    }

    console.log('Message deleted successfully:', messageId);
    revalidatePath('/messages');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteMessage:', error);
    return { error: 'An unexpected error occurred' };
  }
}

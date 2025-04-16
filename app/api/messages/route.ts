// app/actions/messages.ts
'use server';

import { createClientForServer } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function sendMessage(receiverId: string, content: string) {
  const supabase = await createClientForServer();

  // Get current user
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Insert message
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({
      content,
      sender_id: user.id,
      receiver_id: receiverId
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/messages/${receiverId}`);
  return data;
}

export async function getConversation(otherUserId: string) {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` + `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

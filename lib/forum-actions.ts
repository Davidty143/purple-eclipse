import { createClientForServer } from '@/app/utils/supabase/server';

export async function createForum(input: { forum_name: string; forum_description?: string }) {
  const supabase = await createClientForServer();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('Forum')
    .insert({
      forum_name: input.forum_name,
      forum_description: input.forum_description || null,
      forum_created: now,
      forum_modified: now
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase Error Details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    throw error;
  }

  return data;
}

export async function createSubforum(input: { subforum_name: string; subforum_description?: string; forum_id: number }) {
  const supabase = await createClientForServer();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('Subforum')
    .insert({
      subforum_name: input.subforum_name,
      subforum_description: input.subforum_description || null,
      forum_id: input.forum_id,
      subforum_created: now,
      subforum_modified: now,
      subforum_is_deleted: false
    })
    .select(
      `
      *,
      forum:Forum (forum_name)
    `
    )
    .single();

  if (error) {
    console.error('Supabase Subforum Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });

    if (error.code === '23503') {
      throw new Error('Parent forum does not exist');
    }
    throw error;
  }

  return data;
}

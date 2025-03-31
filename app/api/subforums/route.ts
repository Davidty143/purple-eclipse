// app/api/subforums/route.ts
import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer();
    const { subforum_name, subforum_description, forum_id } = await request.json();

    const { data, error } = await supabase
      .from('Subforum')
      .insert([
        {
          subforum_name,
          subforum_description,
          subforum_deleted: false,
          forum_id
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create subforum' }, { status: 500 });
  }
}

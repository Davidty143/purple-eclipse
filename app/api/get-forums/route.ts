// app/api/get-forums/route.ts
import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientForServer();
    const { data, error } = await supabase.from('Forum').select('forum_id, forum_name').order('forum_name', { ascending: true });

    if (error) throw error;

    const forums = data.map((forum) => ({
      id: forum.forum_id,
      name: forum.forum_name
    }));

    console.log('Returning forums:', forums);
    return NextResponse.json(forums);
  } catch (error: any) {
    const errorResponse = { error: error.message || 'Failed to fetch forums' };
    console.error('Returning error:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

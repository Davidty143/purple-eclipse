import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer();
    const { subforum_name, subforum_description, forum_id } = await request.json();
    const currentTimestamp = new Date().toISOString();

    const { data, error } = await supabase
      .from('Subforum')
      .insert([
        {
          subforum_name,
          subforum_description,
          subforum_deleted: false,
          forum_id: Number(forum_id),
          subforum_created: currentTimestamp,
          subforum_modified: currentTimestamp
        }
      ])
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to create subforum',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

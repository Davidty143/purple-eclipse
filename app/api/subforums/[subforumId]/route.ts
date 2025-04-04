// app/api/subforums/[subforumId]/route.ts
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subforumId: string }> } // Note params is now a Promise
) {
  try {
    // Await the params promise
    const { subforumId } = await params;

    // Validate subforumId
    if (!subforumId || !Number.isInteger(Number(subforumId))) {
      return NextResponse.json({ error: 'Invalid subforum ID format' }, { status: 400 });
    }

    const supabase = await createClientForServer();

    const { data, error } = await supabase
      .from('Subforum')
      .select(
        `
        subforum_id,
        subforum_name,
        subforum_description
      `
      )
      .eq('subforum_id', subforumId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Subforum not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: data.subforum_id,
      name: data.subforum_name,
      description: data.subforum_description
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

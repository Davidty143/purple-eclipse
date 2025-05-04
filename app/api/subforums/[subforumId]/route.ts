import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/utils/supabase/server';

// GET: Fetch subforum by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ subforumId: string }> }) {
  try {
    const { subforumId } = await params; // resolve params here

    if (!subforumId || isNaN(Number(subforumId))) {
      return NextResponse.json({ error: 'Invalid subforum ID format' }, { status: 400 });
    }

    const supabase = await createClientForServer();

    const { data, error } = await supabase
      .from('Subforum')
      .select(
        `
        subforum_id,
        subforum_name,
        subforum_description,
        subforum_icon,
        subforum_deleted,
        forum_id,
        subforum_created,
        subforum_modified
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
      description: data.subforum_description,
      icon: data.subforum_icon,
      deleted: data.subforum_deleted,
      forumId: data.forum_id,
      created: data.subforum_created,
      modified: data.subforum_modified
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ PUT: Update subforum
export async function PUT(request: NextRequest, { params }: { params: Promise<{ subforumId: string }> }) {
  try {
    const { subforumId } = await params; // resolve params here
    const subforumIdNumber = Number(subforumId);

    if (isNaN(subforumIdNumber)) {
      return NextResponse.json({ error: 'Invalid subforum ID' }, { status: 400 });
    }

    const body = await request.json();
    const { subforum_name, subforum_description, subforum_icon } = body;

    if (!subforum_name || typeof subforum_name !== 'string') {
      return NextResponse.json({ error: 'Subforum name is required' }, { status: 400 });
    }

    const supabase = await createClientForServer();

    const { error: updateError } = await supabase
      .from('Subforum')
      .update({
        subforum_name,
        subforum_description,
        subforum_icon,
        subforum_modified: new Date().toISOString()
      })
      .eq('subforum_id', subforumIdNumber);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // ✅ Fetch updated record and return it
    const { data: updated, error: fetchError } = await supabase
      .from('Subforum')
      .select(
        `
        subforum_id,
        subforum_name,
        subforum_description,
        subforum_icon,
        subforum_deleted,
        forum_id,
        subforum_created,
        subforum_modified
        `
      )
      .eq('subforum_id', subforumIdNumber)
      .single();

    if (fetchError || !updated) {
      return NextResponse.json({ error: fetchError?.message || 'Failed to fetch updated subforum' }, { status: 500 });
    }

    return NextResponse.json({
      id: updated.subforum_id,
      name: updated.subforum_name,
      description: updated.subforum_description,
      icon: updated.subforum_icon,
      deleted: updated.subforum_deleted,
      forumId: updated.forum_id,
      created: updated.subforum_created,
      modified: updated.subforum_modified
    });
  } catch (err) {
    console.error('PUT server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

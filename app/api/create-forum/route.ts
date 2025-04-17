import { createForum } from '@/lib/forum-actions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('[API] Forum creation request received');

  try {
    const formData = await request.json();
    console.log('[API] Request body:', JSON.stringify(formData, null, 2));

    const forum = await createForum(formData);
    console.log('[API] Forum created successfully:', forum);

    return NextResponse.json(forum, { status: 201 });
  } catch (error: any) {
    console.error('[API] Error creating forum:', {
      message: error.message,
      stack: error.stack,
      raw: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: error.code // Supabase error code if available
      },
      {
        status: error.message.includes('required') ? 400 : 500
      }
    );
  }
}

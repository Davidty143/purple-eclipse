import { createForum } from '@/lib/forum-actions';
import { requireAdminRole } from '@/lib/auth-middleware';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // console.log('[API] Forum creation request received');

  try {
    // Check if user has admin role
    const adminCheck = await requireAdminRole(request);
    if (adminCheck instanceof NextResponse) {
      return adminCheck; // Returns error response if not admin
    }

    const formData = await request.json();
    // console.log('[API] Request body:', JSON.stringify(formData, null, 2));

    const forum = await createForum(formData);
    // console.log('[API] Forum created successfully:', forum);

    return NextResponse.json(forum, { status: 201 });
  } catch (error: any) {
    // Log entire error object to understand its structure
    //console.error('[API] Full error object:', error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    // Extract error code and message from common fields
    const code = error.code ?? error.statusCode ?? error.status;
    const message = error.message ?? error.error_description ?? '';
    const details = error.details ?? '';
    const hint = error.hint ?? '';

    // Check for unique constraint violation on forum_name
    if (code === '23505' || code === 409) {
      if (message.toLowerCase().includes('forum_name') || details.toLowerCase().includes('forum_name') || hint.toLowerCase().includes('forum_name')) {
        errorMessage = 'Forum name is already taken, choose another name';
        statusCode = 400;
      }
    } else if (message.toLowerCase().includes('required')) {
      errorMessage = message;
      statusCode = 400;
    } else if (message) {
      errorMessage = message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        code
      },
      {
        status: statusCode
      }
    );
  }
}

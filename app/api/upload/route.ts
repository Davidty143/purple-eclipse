import { createClientForServer } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const supabase = await createClientForServer();
    const { type, size } = await request.json();

    // Validate file type and size
    if (!type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate a unique filename with proper extension
    const ext = type.split('/')[1];
    const filename = `${uuidv4()}.${ext}`;
    const path = `thread-images/${filename}`;

    // Create a signed URL for upload
    const { data, error } = await supabase.storage.from('thread-images').createSignedUploadUrl(path);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      path: data.path,
      publicUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thread-images/${path}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}

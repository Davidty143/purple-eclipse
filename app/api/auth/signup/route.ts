import { createClientForServer } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const supabase = await createClientForServer();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string
      }
    }
  };

  // Password confirmation check
  if (formData.get('password') !== formData.get('password_confirm')) {
    return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

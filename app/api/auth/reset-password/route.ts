// app/api/auth/reset-password/route.ts
import { sendResetPasswordEmail } from '@/lib/auth-actions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await sendResetPasswordEmail(formData);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: result.success });
}

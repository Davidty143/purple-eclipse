import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UpdatePasswordForm } from './components/UpdatePasswordForm';
import { createClientForServer } from '@/app/utils/supabase/server';

export default async function UpdatePasswordPage() {
  const session = createClientForServer();

  if (!session) {
    redirect('/');
  }

  return (
    <div className="flex items-start pt-10">
      <UpdatePasswordForm />
    </div>
  );
}

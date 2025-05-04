import UserProfile from './components/UserProfile';
import { createClientForServer } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Your Profile</h1>
        <div className="w-full flex flex-col gap-8">
          <div className="w-full flex flex-col gap-6">
            <UserProfile user={user} />
          </div>
        </div>
        <footer className="w-full mt-auto py-4" />
      </div>
    </div>
  );
}

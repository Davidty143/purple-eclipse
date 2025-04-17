import UserProfile from './components/UserProfile';
import { createClientForServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  // If not logged in, redirect to login page
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      <UserProfile user={user} />
    </div>
  );
}

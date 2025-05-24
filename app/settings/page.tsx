import ChangePasswordForm from './components/ChangePasswordForm';
import { createClientForServer } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const loggedInWithGoogle = user.app_metadata?.provider === 'google';

  return (
    <div className="min-h-screen py-6 sm:py-8">
      <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-8">Settings</h1>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/2 space-y-4">
            <nav className="space-y-3">
              <button className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition border-gray-300">Change Password</button>
            </nav>

            {loggedInWithGoogle && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                <p>You signed in with Google and may not have set a password yet. If you want to set a password, logout then click the login button then click the Forgot password form to receive a reset link.</p>
              </div>
            )}
          </aside>

          {/* Main Content */}
          <section className="w-full lg:w-1/2">
            <ChangePasswordForm />
          </section>
        </div>

        <footer className="w-full mt-auto py-4" />
      </div>
    </div>
  );
}

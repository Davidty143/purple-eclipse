import ChangePasswordForm from './components/ChangePasswordForm';
import { createClientForServer } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen py-8">
      <div className="w-full max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/2">
            <nav className="space-y-3 ">
              <button className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-100 transition border-gray-300">Change Password</button>
            </nav>
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

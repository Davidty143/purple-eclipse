import { createClientForServer } from '@/utils/supabase/server';
import Image from 'next/image';
import LandingPage from './(landingPage)/page';
import BodyHeader from '@/components/BodyHeader';

export default async function Home() {
  const supabase = await createClientForServer();

  const session = await supabase.auth.getUser();

  if (!session.data?.user) return <LandingPage />;

  const user = session?.data?.user;
  const user_metadata = user?.user_metadata || {};
  const app_metadata = user?.app_metadata || {};

  const { name, email, username, avatar_url } = user_metadata;
  const userName = username ? `@${username}` : 'User Name Not Set';

  return (
    <div className="">
      {/* Container at the center of the page */}
      <div className="flex flex-col items-center justify-center max-w-3xl mx-auto">
        <BodyHeader />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-4xl font-bold">{name}</h1>
          <p className="text-xl">User Name: {userName}</p>
          <p className="text-xl">Email: {email}</p>
          <p className="text-xl">Created with: {app_metadata?.provider}</p>
        </div>
      </div>
    </div>
  );
}

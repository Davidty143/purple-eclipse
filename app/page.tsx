import { createClientForServer } from '@/utils/supabase/server';
import LandingPage from './(landingPage)/page';

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
        <LandingPage />
      </div>
    </div>
  );
}

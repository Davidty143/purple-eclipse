//root page.tsx
import { createClientForServer } from '@/utils/supabase/server';
import LandingPage from './(landingPage)/page';

export default async function Home() {
  const supabase = await createClientForServer();

  const session = await supabase.auth.getUser();

  return <LandingPage />;
}

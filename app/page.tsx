//root page.tsx
import LandingPage from './(landingPage)/page';
//import { createClientForServer } from '@/app/utils/supabase/server';

export default async function Home() {
  // const supabase = await createClientForServer();

  // const session = await supabase.auth.getUser();

  return <LandingPage />;
}

import { createClientForServer } from '@/utils/supabase/server';
import ConversationsListClient from './components/ConversationsListClient';

export default async function Page() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-center p-4">You must be logged in.</div>;
  }

  return <ConversationsListClient userId={user.id} />;
}

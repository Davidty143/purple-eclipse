import { redirect } from 'next/navigation';
import UserSearch from '@/app/messages/user-search/components/UserSearch';
import { MessageCircle, User } from 'lucide-react';
import { createClientForServer } from '@/app/utils/supabase/server';

export default async function MessagesPage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, created_at').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(1);

  if (conversations && conversations.length > 0) {
    const latest = conversations[0];
    const otherUserId = latest.sender_id === user.id ? latest.receiver_id : latest.sender_id;
    redirect(`/messages/${otherUserId}`);
  }

  return (
    <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto py-4">
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        <div className="w-1/4 border-r bg-background flex flex-col">
          <UserSearch currentUserId={user.id} />
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          </div>
        </div>
        <div className="w-3/4 flex flex-col bg-background">
          <div className="p-4 border-b"></div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
              <p className="text-sm text-muted-foreground mt-2">Search for users above to start a new conversation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

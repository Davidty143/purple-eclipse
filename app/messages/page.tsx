// app/messages/page.tsx
import { createClientForServer } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ConversationsList from './conversations-list/page';
import { UserSearch } from './user-search/page';
import { cn } from '@/lib/utils';
import { MessageCircle, User } from 'lucide-react';

export default async function MessagesPage() {
  const supabase = await createClientForServer();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get the most recent conversation
  const { data: conversations } = await supabase.from('direct_messages').select('sender_id, receiver_id, created_at').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order('created_at', { ascending: false }).limit(1);

  if (conversations && conversations.length > 0) {
    const latestConversation = conversations[0];
    const otherUserId = latestConversation.sender_id === user.id ? latestConversation.receiver_id : latestConversation.sender_id;
    redirect(`/messages/${otherUserId}`);
  }

  // If no conversations exist, show empty state
  return (
    <div className="w-full max-w-[1250px] xl:w-[80%] mx-auto py-4">
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        <div className="w-1/4 border-r bg-background flex flex-col">
          <UserSearch currentUserId={user.id} />
          <div className="flex-1 overflow-y-auto">
            {/* Empty conversation list */}
            <div className="p-6 text-center">
              <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          </div>
        </div>
        <div className="w-3/4 flex flex-col bg-background">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
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

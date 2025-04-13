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

  return (
    <div className={cn('w-full max-w-[1250px] xl:w-[80%] mx-auto py-4')}>
      <div className="flex h-[calc(100vh-160px)] border rounded-lg overflow-hidden">
        {/* Conversations sidebar */}
        <div className="w-1/4 border-r bg-background flex flex-col">
          <UserSearch currentUserId={user.id} />
          <div className="flex-1 overflow-y-auto">
            <ConversationsList userId={user.id} />
          </div>
        </div>

        {/* Main conversation area */}
        <div className="w-3/4 flex flex-col bg-background">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Select a conversation</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
              <p className="text-sm text-muted-foreground mt-2">Or search for users above to start a new conversation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

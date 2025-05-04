import { notFound, redirect } from 'next/navigation';
import EditThreadForm from './components/EditThreadForm';
import { createClientForServer } from '@/app/utils/supabase/server';

interface EditThreadPageProps {
  params: Promise<{ threadId: string }>; // Ensure params is a Promise
}

export default async function EditThreadPage({ params }: EditThreadPageProps) {
  const { threadId } = await params; // Await the params to get the threadId
  const supabase = await createClientForServer();

  // Check authentication
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=' + encodeURIComponent(`/thread/${threadId}/edit`));
  }

  // Fetch thread data
  const { data: thread, error } = await supabase
    .from('Thread')
    .select(
      `*,
      subforum:subforum_id(
        subforum_name,
        subforum_id
      )`
    )
    .eq('thread_id', threadId)
    .eq('thread_deleted', false)
    .single();

  // Check if thread exists and user is the author
  if (error || !thread || thread.author_id !== user.id) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Thread</h1>
      <EditThreadForm thread={thread} user={user} />
    </div>
  );
}

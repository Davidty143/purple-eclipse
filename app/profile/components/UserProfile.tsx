'use client';

import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface Thread {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_created: string;
  subforum: {
    subforum_name: string;
    subforum_id: number;
  };
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();
  const [accountData, setAccountData] = useState<any>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch account data
      const accountResponse = await supabase.from('Account').select('*').eq('account_id', user.id).single();

      if (!accountResponse.error && accountResponse.data) {
        setAccountData(accountResponse.data);
      }
      setLoading(false);

      // Fetch user's threads
      const threadResponse = await supabase
        .from('Thread')
        .select(
          `
          *,
          subforum:subforum_id(*)
        `
        )
        .eq('author_id', user.id)
        .eq('thread_deleted', false)
        .order('thread_created', { ascending: false });

      if (!threadResponse.error && threadResponse.data) {
        // Transform the data to ensure consistent structure
        const formattedThreads: Thread[] = threadResponse.data.map((thread: any) => ({
          thread_id: thread.thread_id,
          thread_title: thread.thread_title,
          thread_content: thread.thread_content,
          thread_created: thread.thread_created,
          subforum: {
            subforum_name: thread.subforum?.subforum_name || 'Unknown',
            subforum_id: thread.subforum?.subforum_id || 0
          }
        }));
        setThreads(formattedThreads);
      }
      setThreadLoading(false);
    };

    fetchData();
  }, [user.id]);

  const handleDeleteThread = async (threadId: number) => {
    try {
      setDeleteLoading(threadId);
      const supabase = createClient();

      // Soft delete the thread
      const { error } = await supabase.from('Thread').update({ thread_deleted: true }).eq('thread_id', threadId).eq('author_id', user.id); // Ensure the user owns this thread

      if (error) {
        throw new Error(error.message);
      }

      // Remove the thread from state
      setThreads(threads.filter((thread) => thread.thread_id !== threadId));
      toast.success('Thread deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete thread: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const name = user.user_metadata?.full_name || user.user_metadata?.name;
  const username = user.user_metadata?.username || accountData?.account_username || user.email?.split('@')[0];
  const provider = user.app_metadata?.provider || 'email';

  return (
    <div className="grid gap-8 ">
      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-slate-50">
          <CardTitle className="text-2xl">User Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="w-32 h-32 rounded-xl">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-4xl">{name ? name.charAt(0).toUpperCase() : username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="space-y-4 flex-1">
              {name && (
                <div>
                  <span className="block text-sm font-medium text-gray-500 mb-1">Full Name</span>
                  <span className="text-xl font-semibold">{name}</span>
                </div>
              )}

              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Username</span>
                <span className="text-xl font-semibold">{username}</span>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
                <span className="text-xl">{user.email}</span>
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Auth Provider</span>
                <span className="capitalize text-xl">{provider}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-4 bg-slate-50">
          <CardTitle className="text-2xl">Your Threads</CardTitle>
          <CardDescription className="text-base">Manage threads you've created</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {threadLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="mt-4 text-base text-gray-500">Loading your threads...</p>
            </div>
          ) : threads.length > 0 ? (
            <div className="space-y-6">
              {threads.map((thread) => (
                <div key={thread.thread_id} className="p-5 border rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link href={`/thread/${thread.thread_id}`} className="hover:underline">
                        <h3 className="font-semibold text-xl">{thread.thread_title}</h3>
                      </Link>
                      <div className="text-sm text-gray-500 mt-2">
                        <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
                        {thread.subforum && (
                          <>
                            <span className="mx-2">•</span>
                            <Badge variant="outline" className="font-normal">
                              {thread.subforum.subforum_name}
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="mt-3 text-base text-gray-600 line-clamp-2">{thread.thread_content}</p>
                    </div>
                    <div className="flex space-x-3 ml-6">
                      <Button variant="outline" size="default" className="flex items-center gap-1.5" onClick={() => router.push(`/thread/${thread.thread_id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                        <span>Edit</span>
                      </Button>
                      <Button variant="destructive" size="default" className="flex items-center gap-1.5" onClick={() => handleDeleteThread(thread.thread_id)} disabled={deleteLoading === thread.thread_id}>
                        {deleteLoading === thread.thread_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">You haven't created any threads yet.</p>
              <Button className="mt-6 px-6 py-2 text-base" size="lg" asChild>
                <Link href="/post-thread">Create Your First Thread</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading account information...</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

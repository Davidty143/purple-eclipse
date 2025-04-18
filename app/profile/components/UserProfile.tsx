'use client';

import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { Pencil, Trash2, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null); // Added state for username error

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const accountResponse = await supabase.from('Account').select('*').eq('account_id', user.id).single();

      if (!accountResponse.error && accountResponse.data) {
        setAccountData(accountResponse.data);
        setNewUsername(accountResponse.data.account_username || user.email?.split('@')[0] || '');
      }

      const threadResponse = await supabase.from('Thread').select('*, subforum:subforum_id(*)').eq('author_id', user.id).eq('thread_deleted', false).order('thread_created', { ascending: false });

      if (!threadResponse.error && threadResponse.data) {
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

      setLoading(false);
      setThreadLoading(false);
    };

    fetchData();
  }, [user.id]);

  const handleDeleteThread = async (threadId: number) => {
    try {
      setDeleteLoading(threadId);
      const supabase = createClient();
      const { error } = await supabase.from('Thread').update({ thread_deleted: true }).eq('thread_id', threadId).eq('author_id', user.id);
      if (error) throw error;

      setThreads(threads.filter((thread) => thread.thread_id !== threadId));
      toast.success('Thread deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete thread: ${error.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const supabase = createClient();

      // Check for username availability
      if (newUsername && newUsername !== accountData?.account_username) {
        const { data: existingUsername, error: checkError } = await supabase.from('Account').select('account_id').eq('account_username', newUsername).neq('account_id', user.id).maybeSingle();

        if (checkError) throw checkError;
        if (existingUsername) {
          setUsernameError('Username is already taken. Please choose another.');
          return;
        } else {
          setUsernameError(null); // Clear any previous error
        }
      }

      let avatarUrl = accountData?.account_avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('account-avatar').upload(filePath, avatarFile, {
          contentType: avatarFile.type,
          upsert: true
        });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('account-avatar').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      } else if (!avatarPreview && accountData?.account_avatar_url) {
        const oldFilePath = accountData.account_avatar_url.split('/').pop();
        await supabase.storage.from('account-avatar').remove([`avatars/${oldFilePath}`]);
        avatarUrl = null;
      }

      const { data: updatedAccount, error: updateError } = await supabase
        .from('Account')
        .update({
          account_username: newUsername,
          account_avatar_url: avatarUrl
        })
        .eq('account_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setAccountData(updatedAccount);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = avatarPreview || accountData?.account_avatar_url;
  const name = accountData?.account_username || user.email?.split('@')[0];
  const username = accountData?.account_username || user.email?.split('@')[0];
  const provider = user.app_metadata?.provider || 'email';

  return (
    <div className="grid gap-8">
      <Card className="overflow-hidden border border-gray-300">
        <CardHeader className=" py-4 border-b border-gray-300 bg-slate-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">User Information</CardTitle>
            {!editMode ? (
              <Button variant="outline" className="border border-gray-300" onClick={() => setEditMode(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="relative">
              <Avatar className="w-32 h-32 rounded-xl">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-4xl">{name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {editMode && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="avatar-upload" className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Change Avatar</span>
                    <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </Label>
                  {(avatarFile || avatarPreview) && (
                    <Button variant="ghost" size="sm" onClick={removeAvatar}>
                      <X className="h-4 w-4 mr-2" />
                      Remove Avatar
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-4 flex-1">
              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Username</span>
                {editMode ? (
                  <>
                    <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="text-xl font-semibold max-w-md" />
                    {usernameError && <p className="text-red-500 text-sm mt-1">{usernameError}</p>}
                  </>
                ) : (
                  <span className="text-xl font-semibold">{username}</span>
                )}
              </div>

              <div>
                <span className="block text-sm font-medium text-gray-500 mb-1">Email</span>
                <span className="text-xl">{user.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CardTitle className="text-2xl font-bold">Your Threads</CardTitle>

      <Card className="overflow-hidden border border-gray-300">
        <CardHeader className=" bg-slate-50 border-b border-gray-300 rounded-t-md">
          <CardDescription className="text-lg text-gray-800 font-semibold">Manage threads you've created</CardDescription>
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
                        <span className="mx-2">•</span>
                        <Badge variant="outline" className="font-normal">
                          {thread.subforum.subforum_name}
                        </Badge>
                      </div>
                      <p className="mt-3 text-base text-gray-600 line-clamp-2">{thread.thread_content}</p>
                    </div>
                    <div className="flex space-x-3 ml-6">
                      <Button variant="outline" onClick={() => router.push(`/thread/${thread.thread_id}/edit`)}>
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteThread(thread.thread_id)} disabled={deleteLoading === thread.thread_id}>
                        {deleteLoading === thread.thread_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-lg">
              <p className="text-gray-500 text-lg">You haven't created any threads yet.</p>
              <Button className="mt-6 px-6 py-2 text-base" size="lg" asChild>
                <Link href="/post-thread">Create Your First Thread</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

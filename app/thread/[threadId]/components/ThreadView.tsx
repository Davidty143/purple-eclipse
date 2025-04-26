'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface Comment {
  comment_id: number;
  comment_content: string;
  comment_created: string;
  comment_deleted: boolean;
  author: {
    account_username: string;
    account_email: string;
    avatar_url?: string | null;
  };
}

interface ThreadImage {
  thread_image_id: number;
  image_url: string;
  storage_path: string;
  created_at: string;
}

interface Thread {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_created: string;
  thread_deleted: boolean;
  author: {
    account_username: string;
    account_email: string;
    avatar_url?: string | null;
  };
  subforum: {
    subforum_name: string;
    subforum_id: number;
    forum: {
      forum_name: string;
    };
  };
  comments: Comment[];
  images: ThreadImage[];
}

interface ThreadViewProps {
  thread: Thread;
}

export default function ThreadView({ thread: initialThread }: ThreadViewProps) {
  const [thread, setThread] = useState(initialThread);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }
    };

    if (lightboxImage) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [lightboxImage]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    const commentContent = newComment.trim();

    // Create optimistic comment
    const optimisticComment: Comment = {
      comment_id: Math.random(), // temporary ID
      comment_content: commentContent,
      comment_created: new Date().toISOString(),
      comment_deleted: false,
      author: {
        account_username: user.user_metadata?.username || 'Anonymous',
        account_email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url
      }
    };

    // Optimistically update UI
    setThread((prev) => ({
      ...prev,
      comments: [...prev.comments, optimisticComment]
    }));
    setNewComment('');

    try {
      // Validate user ID is available
      if (!user.id) {
        throw new Error('User ID is missing');
      }

      const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

      // First check if the account exists in the Account table
      const { data: accountData, error: accountError } = await supabase.from('Account').select('account_id').eq('account_id', user.id).single();

      // If the account doesn't exist, create one
      if (accountError || !accountData) {
        console.log('Account not found, creating new account');
        // Get avatar URL from Google profile
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        const { error: createAccountError } = await supabase.from('Account').insert({
          account_id: user.id,
          account_username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
          account_email: user.email,
          account_is_deleted: false,
          avatar_url: avatarUrl // Add the avatar URL
        });

        if (createAccountError) {
          console.error('Error creating account:', createAccountError);
          throw new Error(`Account creation failed: ${createAccountError.message}`);
        }
      }

      // Now insert the comment
      const { data, error } = await supabase
        .from('Comment')
        .insert({
          comment_content: commentContent,
          thread_id: thread.thread_id,
          author_id: user.id,
          comment_deleted: false,
          comment_created: new Date().toISOString(),
          comment_modified: new Date().toISOString()
        })
        .select(
          `
          *,
          author:author_id (
            account_username,
            account_email
          )
        `
        )
        .single();

      if (error) {
        console.error('Comment insert error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from comment insertion');
      }

      // Update with real comment data
      setThread((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => (c === optimisticComment ? data : c))
      }));

      toast.success('Comment posted successfully');
    } catch (error: any) {
      console.error('Error posting comment:', error);
      // Log more details about the error
      if (error.code) {
        console.error(`Error code: ${error.code}, Message: ${error.message}, Details:`, error.details);
      }

      // Revert optimistic update
      setThread((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c !== optimisticComment)
      }));
      toast.error(`Failed to post comment: ${error.message || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this function to sanitize and optimize image HTML
  const optimizeImages = (content: string) => {
    // Skip processing during SSR since DOMParser is only available in the browser
    if (typeof window === 'undefined') {
      return content;
    }

    // For rich text content with embedded HTML, we can't directly use Next.js Image component
    // so we'll optimize the img tags to improve user experience but keep the HTML structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.getElementsByTagName('img');

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const src = img.getAttribute('src');
      if (src) {
        // Handle both storage URLs and any other valid image URLs
        const optimizedImg = document.createElement('div');
        optimizedImg.className = 'relative w-full max-w-xl mx-auto my-4';
        optimizedImg.innerHTML = `
          <div class="image-container flex justify-center">
            <img 
              src="${src}" 
              alt="" 
              class="rounded-lg shadow-md object-contain max-w-full cursor-pointer"
              style="max-height: 350px; width: auto;"
              loading="lazy" 
              onError="this.onerror=null; this.style.display='none';"
              onclick="this.classList.toggle('expanded'); 
                      if(this.classList.contains('expanded')) {
                        this.style.maxHeight = '90vh'; 
                        this.style.width = 'auto';
                        this.parentElement.classList.add('fixed', 'inset-0', 'z-50', 'bg-black/80', 'flex', 'items-center', 'justify-center', 'p-4');
                      } else {
                        this.style.maxHeight = '350px';
                        this.style.width = 'auto';
                        this.parentElement.classList.remove('fixed', 'inset-0', 'z-50', 'bg-black/80', 'flex', 'items-center', 'justify-center', 'p-4');
                      }"
            />
          </div>
        `;
        img.parentNode?.replaceChild(optimizedImg, img);
      }
    }

    return doc.body.innerHTML;
  };

  if (!thread || thread.thread_deleted) {
    return <div className="flex items-center justify-center min-h-screen">Thread not found or has been deleted</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Link href="/" className="hover:underline">
                  Forums
                </Link>
                <span>&gt;</span>
                <Link href="/forums" className="hover:underline">
                  {thread.subforum.forum.forum_name}
                </Link>
                <span>&gt;</span>
                <Link href={`/forums/subforum/${thread.subforum.subforum_id}`} className="hover:underline">
                  {thread.subforum.subforum_name}
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 border-b pb-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={thread.author?.avatar_url || `https://avatar.vercel.sh/${thread.author?.account_username || 'anon'}`} />
                <AvatarFallback>{(thread.author?.account_username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Main Thread Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{thread.thread_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: optimizeImages(thread.thread_content) }} />

            {/* Thread Images Gallery */}
            {thread.images && thread.images.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {thread.images.map((image) => (
                    <div key={image.thread_image_id} className="relative overflow-hidden rounded-lg shadow-md">
                      <div className="image-container relative aspect-[4/3] group">
                        <Image src={image.image_url} alt="Thread image" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover cursor-pointer transition-transform hover:scale-105" onClick={() => openLightbox(image.image_url)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={closeLightbox}>
            <img src={lightboxImage} alt="Enlarged thread image" className="max-w-full max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Comments</h2>
            <div className="text-sm text-gray-500">{thread.comments.filter((c) => !c.comment_deleted).length} comments</div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {thread.comments
              .filter((comment) => !comment.comment_deleted)
              .map((comment) => (
                <Card key={comment.comment_id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={comment.author.avatar_url || `https://avatar.vercel.sh/${comment.author.account_username || 'anon'}`} />
                        <AvatarFallback>{comment.author.account_username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{comment.author.account_username}</div>
                          <div className="text-sm text-gray-500">{format(new Date(comment.comment_created), 'MMM d, yyyy')}</div>
                        </div>
                        <div className="mt-2 text-gray-700">{comment.comment_content}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>

          {/* Comment Form - Moved below the comments list */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Add Your Comment</h3>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : user ? (
              <form onSubmit={handleCommentSubmit}>
                <div className="border rounded-lg p-4 bg-white">
                  <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write your comment..." className="w-full min-h-[100px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <div className="mt-4 flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-blue-600 text-white hover:bg-blue-700">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                Please{' '}
                <a href="/login" className="text-blue-600 hover:underline">
                  sign in
                </a>{' '}
                to post a comment
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

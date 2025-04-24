'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import Link from 'next/link';
import { Thread } from './interfaces';

interface ThreadContentProps {
  thread: Thread;
  optimizeImages: (content: string) => string;
  openLightbox: (imageUrl: string) => void;
}

export default function ThreadContent({ thread, optimizeImages, openLightbox }: ThreadContentProps) {
  return (
    <>
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
    </>
  );
}

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
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="w-full sm:w-auto">
            <div className="flex flex-wrap items-center space-x-1 text-xs sm:text-sm text-gray-500">
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

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 border-b pb-3 sm:pb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src={thread.author?.account_avatar_url || 'Anon'} />
              <AvatarFallback>{(thread.author?.account_username || 'A').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>Posted by {thread.author?.account_username || 'Anonymous'}</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>{format(new Date(thread.thread_created), 'MMM d, yyyy')}</span>
        </div>
      </div>

      {/* Main Thread Card */}
      <Card className="mb-6 sm:mb-8 mt-3 sm:mt-4">
        <CardHeader className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2 mb-2">{thread.thread_category && <span className="text-xs font-semibold bg-gray-200 px-4 py-0.5 rounded-sm">{thread.thread_category}</span>}</div>
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{thread.thread_title}</h1>
            <div className="h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-8 py-4 sm:py-6">
          <div className="prose prose-sm sm:prose-base max-w-none break-words overflow-hidden px-2 sm:px-4" dangerouslySetInnerHTML={{ __html: optimizeImages(thread.thread_content) }} />

          {/* Thread Images Gallery */}
          {thread.images && thread.images.length > 0 && (
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {thread.images.map((image) => (
                  <div key={image.thread_image_id} className="relative overflow-hidden rounded-lg shadow-md">
                    <div className="image-container relative aspect-[4/3] group">
                      <Image src={image.image_url} alt="Thread image" fill sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" className="object-cover cursor-pointer transition-transform hover:scale-105" onClick={() => openLightbox(image.image_url)} />
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

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ThreadViewProps } from './interfaces';
import { optimizeImages } from './utils/imageUtils';
import ThreadContent from './ThreadContent';
import CommentsList from './CommentsList';
import CommentForm from './CommentForm';
import Lightbox from './Lightbox';
import { useComments } from '../hooks/useComments';
import { useLightbox } from '../hooks/useLightbox';

export default function ThreadView({ thread: initialThread }: ThreadViewProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { lightboxImage, openLightbox, closeLightbox } = useLightbox();

  const { thread: currentThread, newComment, setNewComment, isSubmitting, replyingTo, setReplyingTo, replyContent, setReplyContent, handleCommentSubmit, handleReplySubmit, handleNestedReplySubmit } = useComments(initialThread, user);

  if (!currentThread || currentThread.thread_deleted) {
    return <div className="flex items-center justify-center min-h-screen">Thread not found or has been deleted</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4">
        {/* Thread Header and Content */}
        <ThreadContent thread={currentThread} optimizeImages={optimizeImages} openLightbox={openLightbox} />

        {/* Lightbox */}
        <Lightbox lightboxImage={lightboxImage} closeLightbox={closeLightbox} />

        {/* Comments Section */}
        <CommentsList thread={currentThread} user={user} isSubmitting={isSubmitting} replyingTo={replyingTo} setReplyingTo={setReplyingTo} replyContent={replyContent} setReplyContent={setReplyContent} handleReplySubmit={handleReplySubmit} handleNestedReplySubmit={handleNestedReplySubmit} />

        {/* Comment Form */}
        <CommentForm user={user} loading={loading} newComment={newComment} setNewComment={setNewComment} isSubmitting={isSubmitting} handleCommentSubmit={handleCommentSubmit} />
      </div>
    </div>
  );
}

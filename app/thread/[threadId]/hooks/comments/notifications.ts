import { createBrowserClient } from '@supabase/ssr';
import { NotificationData } from './types';

const validateNotificationData = (data: NotificationData): { isValid: boolean; missingFields: string[] } => {
  console.log('Validating notification data:', data);
  const requiredFields = ['recipient_id', 'sender_id', 'thread_id', 'comment_id', 'type'] as const;
  const missingFields = requiredFields.filter((field) => !data[field]);

  const result = {
    isValid: missingFields.length === 0,
    missingFields
  };

  console.log('Validation result:', result);
  return result;
};

export const createNotification = async (notificationData: NotificationData): Promise<void> => {
  console.log('Starting createNotification with data:', notificationData);

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set');
    return;
  }

  // Validate notification data
  const { isValid, missingFields } = validateNotificationData(notificationData);
  if (!isValid) {
    console.error(`Cannot create notification: missing required fields: ${missingFields.join(', ')}`);
    return;
  }

  // Additional validation
  if (notificationData.recipient_id === notificationData.sender_id) {
    console.log('Skipping self-notification');
    return;
  }

  // Create a new client with the current session
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('Created Supabase client for notification creation');

  try {
    // Get the current session and ensure we're authenticated
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    console.log('Current session state:', {
      hasSession: !!session,
      userId: session?.user?.id,
      senderId: notificationData.sender_id,
      isAuthenticated: !!session?.user,
      accessToken: session?.access_token ? 'present' : 'missing'
    });

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return;
    }

    if (!session?.user) {
      console.error('No authenticated user found');
      return;
    }

    // Verify that the sender_id matches the authenticated user
    if (session.user.id !== notificationData.sender_id) {
      console.error('Sender ID does not match authenticated user:', {
        senderId: notificationData.sender_id,
        authenticatedUserId: session.user.id
      });
      return;
    }

    // First verify that the recipient exists
    console.log('Verifying recipient account:', notificationData.recipient_id);
    const { data: recipientData, error: recipientError } = await supabase.from('Account').select('account_id, account_username').eq('account_id', notificationData.recipient_id).single();

    console.log('Recipient verification result:', { recipientData, recipientError });

    if (recipientError || !recipientData) {
      console.error('Recipient account not found:', notificationData.recipient_id);
      return;
    }

    // Then verify that the sender exists
    console.log('Verifying sender account:', notificationData.sender_id);
    const { data: senderData, error: senderError } = await supabase.from('Account').select('account_id, account_username').eq('account_id', notificationData.sender_id).single();

    console.log('Sender verification result:', { senderData, senderError });

    if (senderError || !senderData) {
      console.error('Sender account not found:', notificationData.sender_id);
      return;
    }

    // Create the notification with explicit auth context
    console.log('Creating notification record in database with data:', {
      ...notificationData,
      created_at: new Date().toISOString(),
      auth: {
        userId: session.user.id,
        hasAccessToken: !!session.access_token
      }
    });

    // Use the authenticated session for the insert
    const { data: notificationResult, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    console.log('Notification creation result:', {
      success: !notificationError,
      error: notificationError
        ? {
            message: notificationError.message,
            code: notificationError.code,
            details: notificationError.details,
            hint: notificationError.hint,
            auth: {
              userId: session.user.id,
              hasAccessToken: !!session.access_token
            }
          }
        : null,
      result: notificationResult
    });

    if (notificationError) {
      if (notificationError.code === '42501') {
        console.error('Permission denied. RLS policy violation:', {
          userId: session.user.id,
          senderId: notificationData.sender_id,
          recipientId: notificationData.recipient_id,
          hasAccessToken: !!session.access_token,
          error: notificationError.message
        });
      } else {
        console.error('Error creating notification:', notificationError.message);
        console.error('Error details:', {
          code: notificationError.code,
          details: notificationError.details,
          hint: notificationError.hint
        });
      }
      if (notificationError.code === '23505') {
        console.log('Notification already exists');
      }
    } else {
      console.log(`${notificationData.type} notification created successfully:`, {
        notificationId: notificationResult?.notification_id,
        recipient: recipientData.account_username,
        sender: senderData.account_username,
        type: notificationData.type
      });
    }
  } catch (error) {
    console.error('Unexpected error creating notification:', error);
  }
};

export const createCommentNotification = async (recipientId: string, senderId: string, threadId: number, commentId: number, type: 'COMMENT' | 'REPLY'): Promise<void> => {
  console.log('Creating comment notification:', {
    recipientId,
    senderId,
    threadId,
    commentId,
    type
  });

  const notificationData: NotificationData = {
    recipient_id: recipientId,
    sender_id: senderId,
    thread_id: threadId,
    comment_id: commentId,
    type,
    is_read: false,
    created_at: new Date().toISOString()
  };

  await createNotification(notificationData);
};

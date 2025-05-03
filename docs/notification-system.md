# Notification System Implementation

This document outlines the implementation of the notification system in the Purple Eclipse application.

## Schema

The notification system uses the following schema in Prisma:

```prisma
model Notification {
  notification_id     Int               @id @default(autoincrement())
  recipient_id        String            @db.Uuid // Who should receive the notification
  sender_id           String            @db.Uuid // Who triggered the notification
  comment_id          Int?              // Optional if related to a comment
  thread_id           Int?              // Optional if related to a thread
  type                NotificationType  // COMMENT or REPLY
  is_read             Boolean           @default(false)
  created_at          DateTime          @default(now()) @db.Timestamptz(6)

  recipient           Account           @relation("NotificationRecipient", fields: [recipient_id], references: [account_id])
  sender              Account           @relation("NotificationSender", fields: [sender_id], references: [account_id])
  comment             Comment?          @relation(fields: [comment_id], references: [comment_id])
  thread              Thread?           @relation(fields: [thread_id], references: [thread_id])

  @@index([recipient_id])
  @@index([sender_id])
  @@index([comment_id])
  @@index([thread_id])
  @@map("notifications")
}

enum NotificationType {
  COMMENT
  REPLY
}
```

## Schema Migration

To apply the schema changes:

1. Ensure that Prisma is up-to-date with the latest schema
2. Run the migration script:

```bash
node scripts/apply-notification-migration.js
```

Alternatively, you can manually apply the migration with:

```bash
npx prisma migrate dev --name fix_notification_schema
npx prisma generate
```

## Components

The notification system consists of these key components:

1. **NotificationDropdown Component** - A dropdown menu that displays recent notifications and allows users to mark them as read.

2. **Notification Creation** - Implemented in `useComments.ts` to create notifications when:

   - A new comment is added to a thread (for the thread author)
   - A reply is added to a comment (for the comment author)

3. **Notifications Page** - A dedicated page to view and manage all notifications, including:
   - Marking notifications as read
   - Deleting notifications
   - Batch operations

## Implementation Details

### Creating Notifications

Notifications are created automatically when:

- A user comments on a thread (notification sent to thread author)
- A user replies to a comment (notification sent to comment author)

Sample code for creating a notification:

```typescript
await supabase.from('notifications').insert({
  recipient_id: threadData.author_id,
  sender_id: user.id,
  comment_id: data.comment_id,
  thread_id: thread.thread_id,
  type: 'COMMENT',
  is_read: false
});
```

### Real-time Updates

The system uses Supabase's real-time functionality to update notifications immediately:

```typescript
const channel = supabase
  .channel('notifications')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` }, (payload) => {
    fetchNotifications();
  })
  .subscribe();
```

## User Interface

The notification UI includes:

1. A bell icon in the header with an unread count badge
2. A dropdown showing recent notifications
3. A dedicated page for viewing all notifications
4. Visual indicators for unread notifications (blue background)
5. Options to mark notifications as read individually or in bulk
6. Batch selection for deleting multiple notifications

## Accessibility Considerations

- All interactive elements have aria-labels
- Focus states are visible for keyboard navigation
- Color contrast meets WCAG guidelines
- Responsive design works on all device sizes

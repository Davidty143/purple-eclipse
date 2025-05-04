import MessageBubble from '@/app/messages/message-bubble/components/MessageBubble';

const message = {
  id: '1',
  content: 'Hello!',
  created_at: new Date().toISOString(),
  sender_id: 'user1',
  receiver_id: 'user2',
  is_read: false
};

export default function MessageBubblePage() {
  return (
    <div>
      <MessageBubble message={message} isCurrentUser={false} />
    </div>
  );
}

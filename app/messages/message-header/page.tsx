// messages/message-header.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function MessageHeader() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');

  return <h2 className="text-lg font-semibold">Messages {username ? `with ${username}` : ''}</h2>;
}

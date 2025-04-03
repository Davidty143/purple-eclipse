'use client';

import { useRouter } from 'next/navigation';

interface SubforumCardProps {
  name: string;
  subforumId: number;
}

export function SubforumCard({ name, subforumId }: SubforumCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/forums/subforum/${subforumId}`);
  };

  return (
    <div className="py-4 px-6 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={handleClick}>
      <h3 className="font-medium">{name}</h3>
    </div>
  );
}

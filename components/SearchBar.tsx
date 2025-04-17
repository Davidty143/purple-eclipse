'use client';

import { Input } from '@/components/ui/input';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full">
      <div className="flex items-center w-full space-x-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-900 px-3.5 py-2 overflow-hidden">
        <SearchIcon className="h-4 w-4 text-gray-500" />
        <Input type="search" placeholder="Search..." className="w-full border-0 h-6 font-semibold bg-gray-50 focus:outline-none focus:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
    </form>
  );
}

interface SearchIconProps {
  className?: string;
}

function SearchIcon({ className }: SearchIconProps) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

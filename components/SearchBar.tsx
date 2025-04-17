'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

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
      <div className="flex items-center w-full space-x-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 focus-within:border-blue-300 focus-within:ring-1 focus-within:ring-blue-300 transition-colors px-3 py-1.5 overflow-hidden">
        <Search className="h-4 w-4 text-gray-500" />
        <Input type="search" placeholder="Search threads and content..." className="w-full border-0 h-8 bg-transparent focus:outline-none focus:ring-0" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-gray-500 hover:text-gray-700">
          Search
        </Button>
      </div>
    </form>
  );
}

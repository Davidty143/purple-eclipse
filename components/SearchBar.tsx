'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto">
      <motion.div
        initial={false}
        animate={{
          borderColor: isFocused ? '#277858' : 'hsl(214.3 31.8% 91.4%)',
          boxShadow: isFocused ? '0 0 0 1px #277858' : 'none'
        }}
        transition={{ duration: 0.15 }}
        className="flex items-center w-full space-x-2 rounded-lg border bg-white focus-within:ring-2 focus-within:ring-[#277858]/20 transition-all px-3 py-1.5 overflow-hidden shadow-sm hover:shadow-md hover:border-[#277858]">
        <Input
          type="text" // Changed from "search" to "text" to prevent browser's clear button
          placeholder="Search threads and content..."
          className="w-full border-0 h-9 bg-transparent focus:ring-0 focus-visible:ring-0 text-sm placeholder:text-gray-400 appearance-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}>
            <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-[#277858] hover:bg-[#277858]/10 rounded-md" onClick={() => setQuery('')}>
              <X className="h-4 w-4 text-[#277858]" />
            </Button>
          </motion.div>
        )}
        <Button type="submit" size="sm" variant={query.trim() ? 'default' : 'ghost'} className={`h-8 px-3 transition-all duration-200 ${query.trim() ? 'bg-[#277858] hover:bg-[#277858]/90 shadow-sm text-white' : 'hover:text-[#277858] hover:bg-[#277858]/10'}`} disabled={!query.trim()}>
          Search
        </Button>
      </motion.div>
    </form>
  );
}

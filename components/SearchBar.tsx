'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-[300px] mx-auto">
      <form onSubmit={handleSearch}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search threads and content..." value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setShowDropdown(true)} className="w-full pl-11 pr-9 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#2b7a58] focus:border-[#2b7a58] transition" />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#2b7a58]" aria-label="Clear">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showDropdown && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} transition={{ duration: 0.2 }} className="absolute top-14 left-0 w-full bg-white border border-gray-200 rounded-md shadow-md p-4 z-50">
            <div className="mb-4">
              <label htmlFor="userSearch" className="block text-sm font-medium text-gray-600 mb-1">
                Search by User
              </label>
              <input id="userSearch" type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Enter username..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#2b7a58] focus:border-[#2b7a58] placeholder:text-gray-400" />
            </div>

            <button onClick={handleSearch} className="w-full bg-[#2b7a58] text-white px-4 py-2 rounded-md text-sm hover:bg-[#256c4e] transition">
              Search “{query}”
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

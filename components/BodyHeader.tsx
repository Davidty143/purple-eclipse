import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi'; // Add an icon

const BodyHeader = () => {
  return (
    <div className="bg-gradient-to-r from-[#267858] to-[#3a9f7e] text-white p-5 rounded-md mb-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <h1 className="text-lg font-semibold">WELCOME TO VISCONN!</h1>

        {/* Button */}
        <Link href="/post-thread" className="sm:ml-auto">
          <Button className="flex items-center gap-2 px-4 text-sm border border-white bg-white text-[#267858] hover:bg-gray-100 w-full sm:w-auto">
            Post Thread
            <FiPlus className="text-[#267858]" />
          </Button>
        </Link>
      </div>

      {/* Description */}
      <div className="mt-3 text-sm text-white w-full sm:w-3/5">Visconn is a place to connect, share ideas, and join discussions. Engage with others through threads, comments, and more.</div>
    </div>
  );
};

export default BodyHeader;

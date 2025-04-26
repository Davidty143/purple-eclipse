import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const BodyHeader = () => {
  return (
    <div className="border border-gray-300 p-5 rounded-md mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <h1 className="text-lg font-semibold">WELCOME TO VISCONN!</h1>

        {/* Button */}
        <Link href="/post-thread" className="sm:ml-auto">
          <Button className="px-4 text-sm border border-gray-300 bg-white text-black hover:bg-gray-100 w-full sm:w-auto">Post Thread</Button>
        </Link>
      </div>

      {/* Description */}
      <div className="mt-3 text-sm text-gray-500 w-full sm:w-3/5">Visconn is a place to connect, share ideas, and join discussions. Engage with others through threads, comments, and more.</div>
    </div>
  );
};

export default BodyHeader;

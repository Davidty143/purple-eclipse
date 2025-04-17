import React from 'react';
import ThreadNameRow from '@/components/ThreadNameRow';

const ThreadNameBlock = () => {
  return (
    <div className="border-2 rounded-md">
      <div className="thread-block py-2 px-4 rounded-md border-2 border-t-0 bg-gray-100 border-l-0 border-r-0  rounded-b-none">
        {/* Forum Title Section with background color */}
        <div className="forum-title py-2">
          <h2 className="text-sm font-semibold">Forum Title</h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="thread-content text-gray-600">
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <ThreadNameRow />
        <button className="hover:text-black underline text-sm text-start px-6 py-3.5"> See More...</button>
      </div>
    </div>
  );
};

export default ThreadNameBlock;

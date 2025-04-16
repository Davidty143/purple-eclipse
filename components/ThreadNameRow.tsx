import React from 'react';
import Image from 'next/image';

const ThreadNameRow = () => {
  return (
    <div className="thread-row py-3 px-6 flex flex-col w-full">
      {/* Poster's Profile */}

      <div className="flex items-center space-x-4 justify-start w-full">
        {/* Profile Picture (circular) */}
        <div className="flex flex-row gap-4">
          <div className="w-8 h-8 rounded-full bg-gray-300 relative">
            <Image
              src="https://via.placeholder.com/150" // Placeholder image
              alt="Profile"
              fill
              className="object-cover rounded-full"
            />
          </div>
        </div>
        {/* Thread Details */}
        <div className="flex  items-center">
          <div className=" ">
            <div className="flex justify-start items-center gap-2">
              <h3 className="text-sm font-semibold">Thread Title</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadNameRow;

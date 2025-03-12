import React from "react";

const ThreadRow = () => {
  return (
    <div className="thread-row py-3.5 px-6 flex flex-col">
      {/* Poster's Profile */}

      <div className="flex items-center space-x-4 justify-between">
        {/* Profile Picture (circular) */}
        <div className="flex flex-row gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-300">
            <img
              src="https://via.placeholder.com/150" // Placeholder image
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Thread Details */}
          <div className="flex  items-center">
            <div className=" ">
              <div className="flex justify-start items-center gap-2">
                {/* Tag and Thread Name */}
                <span className=" text-xs font-semibold  bg-gray-200 px-4 py-0.5 rounded-sm">
                  Help
                </span>
                <h3 className="text-md font-semibold">Thread Title</h3>
              </div>
              <div className="text-xs text-semibold text-gray-500">
                {/* Poster Name and Date Posted */}
                <span>Posted by John Doe</span> - <span>March 11, 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Replies and Views */}
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex flex-col items-start">
            <span className=" px-2 text-xs">Replies: 10</span>
            <span className=" px-2 text-xs ">Views: 120</span>
          </div>
        </div>

        {/* Last Comment Section */}
        <div className="flex justify-between items-center text-sm text-gray-500 ">
          {/* Last Commenter's Profile */}
          <div className="flex items-center space-x-6">
            <div className="flex flex-col text-xs">
              <span>2:11 AM</span>
              <span>Benjie Saqin</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300">
              <img
                src="https://via.placeholder.com/150" // Placeholder image
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadRow;

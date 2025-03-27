import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoggedInHeaderRight({
  user,
}: {
  user: { name: string; avatar_url: string };
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      {/* Profile picture + name */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt="Profile"
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm font-medium">{user.name}</span>
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Settings
          </Link>
          <button
            onClick={() => supabase.auth.signOut()} // Add your Supabase logout logic
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

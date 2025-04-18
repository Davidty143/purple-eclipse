import React from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <main className="w-[1250px] 2xl:w-[80%] mx-auto px-3">{children}</main>
    </div>
  );
}

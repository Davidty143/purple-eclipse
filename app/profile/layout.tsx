import React from 'react';

export default function ProfileLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <main className="container mx-auto">{children}</main>
    </div>
  );
}

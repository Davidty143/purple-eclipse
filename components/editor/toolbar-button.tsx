import { cn } from '@/lib/utils';
import React from 'react';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

export const ToolbarButton = ({ onClick, isActive = false, title, children }: ToolbarButtonProps) => (
  <button onClick={onClick} className={cn('p-2 rounded-md transition-colors', isActive ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100 text-gray-700', 'focus:outline-none focus:ring-2 focus:ring-[#267858] focus:ring-opacity-50')} title={title} type="button">
    {children}
  </button>
);

export const ToolbarDivider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

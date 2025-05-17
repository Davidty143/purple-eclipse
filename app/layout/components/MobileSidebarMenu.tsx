'use client';

import { useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiHome, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import React from 'react';

// Types
type MenuItem = {
  text: string;
  href: string;
};

type Menu = {
  title: string;
  link: string;
  icon: React.ElementType;
  items?: MenuItem[];
};

// Menu data
const menus: Record<string, Menu> = {
  home: {
    title: 'Home',
    link: '/',
    icon: FiHome
  },
  forums: {
    title: 'Forums',
    link: '/forums',
    icon: FiUsers
  },
  trending: {
    title: 'Trending',
    link: '/trending',
    icon: FiTrendingUp
  },
  latest: {
    title: 'Latest',
    link: '/latest',
    icon: FiClock
  }
};

const MobileSidebarMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button className="block md:hidden p-2" aria-label="Open menu" onClick={() => setMobileMenuOpen(true)}>
        <FiMenu className="h-6 w-6 text-gray-800" />
      </button>

      {/* Overlay */}
      {mobileMenuOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />}

      {/* Sidebar Menu */}
      <div className={`md:hidden fixed top-0 left-0 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-5/6 sm:w-1/2`}>
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-xl font-extrabold text-[#2b7a58]" onClick={() => setMobileMenuOpen(false)}>
              VISCONN
            </Link>
            <button className="p-2 rounded-lg text-gray-700 hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* SearchBar */}
          <div className="mb-4 w-full">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className="space-y-1">
              {Object.values(menus).map((menu, index) => (
                <MobileDropdown key={index} title={menu.title} link={menu.link} items={menu.items ?? []} icon={menu.icon} onItemClick={() => setMobileMenuOpen(false)} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-gray-200 text-xs text-gray-500">
            <div className="flex flex-col space-y-1">
              <span>© {new Date().getFullYear()} Tenza</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MobileDropdown = ({ title, link, items, icon: Icon, onItemClick }: { title: string; link: string; items: MenuItem[]; icon: React.ElementType; onItemClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // If there are no sub-items, render as a simple link
  if (items.length === 0) {
    return (
      <Link href={link} onClick={onItemClick} className="flex items-center gap-2 px-4 py-3 rounded-md hover:bg-gray-100 text-base font-medium text-gray-800 transition-colors">
        <Icon className="w-4 h-4" />
        <span>{title}</span>
      </Link>
    );
  }

  // Otherwise, render as dropdown
  return (
    <div className={`rounded-md transition-colors mb-1 ${isOpen ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className={`text-base font-medium flex-1 ${isOpen ? 'text-[#2b7a58]' : 'text-gray-800'}`}>{title}</span>
        </div>
        {isOpen ? <FiChevronUp className="w-5 h-5 text-[#2b7a58]" /> : <FiChevronDown className="w-5 h-5 text-gray-400" />}
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <ul className="space-y-1 px-4 py-1">
          {items.map((item, index) => (
            <li key={index}>
              <Link href={item.href} className="block text-sm text-gray-600 px-2 py-2 rounded-md hover:bg-gray-100 hover:text-[#2b7a58] transition-colors" onClick={onItemClick}>
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MobileSidebarMenu;

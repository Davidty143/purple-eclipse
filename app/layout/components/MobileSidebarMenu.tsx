'use client';

import { useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiHome, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar'; // Import the SearchBar component

const menus = {
  home: {
    title: 'Home',
    link: '/',
    icon: FiHome,
    items: [
      { text: "What's New", href: '/newposts' },
      { text: 'Trending Now', href: '/trendingposts' },
      { text: 'Popular', href: '/popularposts' }
    ]
  },
  forums: {
    title: 'Forums',
    link: '/forums',
    icon: FiUsers,
    items: [
      { text: 'Academics', href: '/forum1' },
      { text: 'Courses', href: '/forum2' },
      { text: 'Lifestyle', href: '/forum3' }
    ]
  },
  trending: {
    title: 'Trending',
    link: '/trending',
    icon: FiTrendingUp,
    items: [
      { text: 'Today', href: '/daily-trending' },
      { text: 'This Week', href: '/weekly-trending' },
      { text: 'This Month', href: '/monthly-trending' }
    ]
  },
  latest: {
    title: 'Latest',
    link: '/latest',
    icon: FiClock,
    items: [
      { text: 'New Topics', href: '/newtopics' },
      { text: 'New Questions', href: '/newquestions' },
      { text: 'New Solutions', href: '/newsolutions' }
    ]
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
      <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} />

      {/* Sidebar Menu */}
      <div className={`md:hidden fixed top-0 left-0 h-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-5/6 sm:w-1/2`}>
        {' '}
        {/* Set width to 3/4 of screen */}
        <div className="p-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="text-xl font-bold text-[#2b7a58]" onClick={() => setMobileMenuOpen(false)}>
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
                <MobileDropdown key={index} title={menu.title} link={menu.link} items={menu.items} icon={menu.icon} onItemClick={() => setMobileMenuOpen(false)} />
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-gray-200 text-xs text-gray-500">
            <div className="flex flex-col space-y-1">
              <Link href="/privacy" onClick={() => setMobileMenuOpen(false)}>
                Privacy Policy
              </Link>
              <Link href="/terms" onClick={() => setMobileMenuOpen(false)}>
                Terms of Service
              </Link>
              <span>© {new Date().getFullYear()} Tenza</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const MobileDropdown = ({ title, link, items, icon: Icon, onItemClick }: { title: string; link: string; items: { text: string; href: string }[]; icon: React.ElementType; onItemClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-md transition-colors mb-1 ${isOpen ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className={`text-base font-medium flex-1 transition-colors ${isOpen ? 'text-[#2b7a58]' : 'text-gray-800'}`} onClick={onItemClick}>
            {title}
          </span>
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

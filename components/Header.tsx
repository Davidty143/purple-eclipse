'use client';

import { useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiHome, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
import Link from 'next/link';

const Header = () => {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full py-3 px-4 md:px-0">
        <div className="flex items-center justify-between w-full">
          {/* Hamburger Menu - Left */}
          <div className="md:hidden">
            <button className="-ml-4 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-1">
            {Object.values(menus).map((menu, index) => (
              <DesktopDropdown key={index} title={menu.title} link={menu.link} items={menu.items} icon={menu.icon} />
            ))}
          </nav>
        </div>

        {/* Mobile overlay */}
        <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMobileMenuOpen(false)} />

        {/* Mobile slide menu */}
        <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

            {/* Mobile nav */}
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
      </div>
    </header>
  );
};

// Desktop Dropdown
const DesktopDropdown = ({ title, link, items, icon: Icon }: { title: string; link: string; items: { text: string; href: string }[]; icon: React.ElementType }) => {
  return (
    <div className="relative group">
      {/* Dropdown header */}
      <Link href={link} className="flex justify-between items-center text-sm w-full pr-4 py-2 text-gray-700 rounded-lg transition-colors font-medium group-hover:text-[color:#2b7a58] group-hover:font-semibold">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-left">{title}</span>
        </div>
        <FiChevronDown className="ml-2 transition-transform group-hover:rotate-180 group-hover:text-[color:#2b7a58]" />
      </Link>

      {/* Dropdown menu */}
      <div className="absolute left-0 mt-2 text-sm w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {items.map((item, index) => (
            <Link key={index} href={item.href} className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors">
              {item.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile Dropdown
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

export default Header;

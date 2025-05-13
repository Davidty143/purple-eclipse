'use client';

import { FiChevronDown, FiHome, FiUsers, FiTrendingUp, FiClock } from 'react-icons/fi';
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

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="w-full py-3 px-4 md:px-0">
        <div className="flex items-center justify-between w-full">
          {/* Desktop Menu */}
          <nav className="flex space-x-1">
            {Object.values(menus).map((menu, index) => (
              <DesktopDropdown key={index} title={menu.title} link={menu.link} items={menu.items} icon={menu.icon} />
            ))}
          </nav>
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
      <div className="absolute left-0 mt-2 text-sm w-56 origin-top-right bg-white rounded-lg ring-1 ring-black ring-opacity-5 focus:outline-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
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

export default Header;

'use client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RiArrowDropDownFill } from 'react-icons/ri';
import Link from 'next/link';

// Define types for the menu items
interface DropdownMenuProps {
  menuItems: { text: string; href: string }[]; // Array of objects with text and href
  triggerText: string; // Text for the dropdown trigger (this is used as the title)
  triggerLink: string; // Link for the title (e.g., "/home")
  dropdownPosition?: string; // Custom position as a string
}

const HeaderDropdownMenu = ({
  menuItems,
  triggerText,
  triggerLink,
  dropdownPosition = 'left' // Default position is left
}: DropdownMenuProps) => {
  // We will apply the custom position class if it exists
  const positionClass = dropdownPosition ? dropdownPosition : 'left-0';

  return (
    <DropdownMenu>
      {/* Link for the main trigger to navigate to its page */}
      <div className="relative group">
        <Link href={triggerLink} className="bg-[#D9D9D9] py-2 px-4 rounded flex items-center cursor-pointer">
          {/* Dropdown trigger (icon and title) */}
          <span className="text-black">{triggerText}</span>
          <DropdownMenuTrigger asChild>
            <RiArrowDropDownFill className="ml-2 text-2xl text-black" />
          </DropdownMenuTrigger>
        </Link>

        {/* Dropdown menu content */}
        <DropdownMenuContent className={`absolute mt-2 w-auto ${positionClass} transform hidden group-hover:block`}>
          {menuItems.map((item, index) => (
            <DropdownMenuItem key={index} className="hover:bg-gray-100">
              {/* Link each item to its specified href */}
              <Link href={item.href} className="w-full">
                {item.text}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
};

export default HeaderDropdownMenu;

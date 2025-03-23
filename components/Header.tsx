import HeaderDropdownMenu from "./HeaderDropDownMenu";

const Header = () => {
  // Define different menu items for each dropdown with their corresponding links
  const menu1 = [
    { text: "What's New", href: "/newposts" },
    { text: "Trending Now", href: "/trendingposts" },
    { text: "Popular", href: "/popularposts" },
  ];
  const menu2 = [
    { text: "Forum1", href: "/forum1" },
    { text: "Forum2", href: "/forum2" },
    { text: "Forum3", href: "/forum3" },
  ];
  const menu3 = [
    { text: "This Day", href: "/dailtrending" },
    { text: "This Week", href: "/weeklytrending" },
    { text: "This Month", href: "/monthlytrending" },
  ];
  const menu4 = [
    { text: "New Topics", href: "/newtopics" },
    { text: "New Questions", href: "/newquestions" },
    { text: "New Solutions", href: "/newsolutions" },
  ];

  return (
    <header className="flex text-sm justify-between items-center py-4 min-w-full max-h-full space-x-4">
      {/* Container for horizontal scroll on mobile, with max-width set to 300px */}
      <div className="flex overflow-x-auto md:overflow-x-visible md:flex-nowrap space-x-4 max-w-[200px] md:max-w-full">
        {/* First Dropdown Menu with custom trigger text and main link */}
        <HeaderDropdownMenu
          menuItems={menu1}
          triggerText="Home"
          dropdownPosition="left-[-73px]"
          triggerLink="/"
        />

        {/* Second Dropdown Menu with custom trigger text and main link */}
        <HeaderDropdownMenu
          menuItems={menu2}
          triggerText="Forums"
          triggerLink="/forums"
          dropdownPosition="left-[-84px]" // Custom position class
        />

        {/* Third Dropdown Menu with custom trigger text and main link */}
        <HeaderDropdownMenu
          menuItems={menu3}
          triggerText="Trending"
          triggerLink="/trending"
          dropdownPosition="left-[-95px]" // Custom position class
        />

        {/* Fourth Dropdown Menu with custom trigger text and main link */}
        <HeaderDropdownMenu
          menuItems={menu4}
          triggerText="Latest"
          triggerLink="/latest"
          dropdownPosition="left-[-74.014px]" // Custom position class
        />
      </div>
    </header>
  );
};

export default Header;

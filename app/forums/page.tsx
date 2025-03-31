// app/forums/page.tsx
import { LandingHeader } from '@/app/(landingPage)/components/LandingHeader';
import { NewTopics } from '@/app/(landingPage)/components/NewTopics';
import { ForumComponentWrapper } from './components/ForumComponentWrapper';

const ForumsPage = () => {
  // Data for multiple forums
  const forums = [
    {
      title: 'General Forum',
      subforums: ['Announcements', 'General Discussion', 'Help & Support', 'Feature Requests']
    },
    {
      title: 'Games Forum',
      subforums: ['Game Announcements', 'Game Discussions', 'Troubleshooting', 'Suggestions']
    }
  ];

  return (
    <div className="min-h-screen flex justify-center py-5">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-6">
          {/* Main Content */}
          <div className="w-full flex flex-col gap-8">
            {' '}
            {/* Increased gap between forums */}
            <LandingHeader />
            {/* Render all forums */}
            {forums.map((forum, index) => (
              <ForumComponentWrapper key={index} forumTitle={forum.title} subforums={forum.subforums} showActions={true} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:w-[350px] flex-shrink-0 flex flex-col space-y-6">
            <NewTopics />
          </div>
        </div>

        <footer className="w-full mt-auto py-4 ">{/* Footer content */}</footer>
      </div>
    </div>
  );
};

export default ForumsPage;

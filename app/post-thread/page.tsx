import PostThread from './components/PostThread';
import { NewTopics } from '@/app/landingPage/components/NewTopics'; // If you need this sidebar content
import BodyHeader from '@/components/BodyHeader'; // You can include this or customize a header for your page

const PostThreadPage = () => {
  return (
    <div className="min-h-screen flex justify-center py-8">
      <div className="w-[1250px] 2xl:w-[80%] flex flex-col px-3">
        <div className="w-full flex flex-col lg:flex-row justify-between gap-8">
          <div className="w-full flex flex-col gap-6">
            <PostThread />
          </div>
        </div>
        <footer className="w-full mt-auto py-4"></footer>
      </div>
    </div>
  );
};

export default PostThreadPage;

import { NewTopics } from "./components/NewTopics";
import { LandingHeader } from "./components/LandingHeader"
import { FeaturedTopics } from "./components/FeaturedTopics";

const LandingPage = () => {
    return (
    <div className="flex flex-row space-x-10 justify-center">
        <div className="flex flex-1 flex-col space-y-14">
            <LandingHeader />
            <FeaturedTopics />
        </div>
        <div className="flex flex-1 flex-col space-y-14">
            <NewTopics />
        </div>
    </div>
    )
}

export default LandingPage;
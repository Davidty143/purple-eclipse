import Image from "next/image";
import BodyHeader from "@/components/BodyHeader";
import ThreadBlock from "@/components/ThreadBlock";
import ThreadNameBlock from "@/components/ThreadNameBlock";

export default function Home() {
  return (
    <main>
      {/* Main Wrapper */}
      <div className=" min-h-screen flex justify-center">
        {/* Focus Content */}
        <div className="w-[1250px] 2xl:w-[80%] flex flex-col gap-4">
          {/* Main Body */}
          <div className="w-full flex flex-col lg:flex-row justify-between gap-6">
            {/* Content Body */}
            <div className=" w-full flex flex-col gap-4 mt-4">
              <BodyHeader />
              <ThreadBlock />
              <ThreadBlock />
              <ThreadBlock />
              <ThreadBlock />
            </div>
            {/* Sidebar Body */}
            <div className=" lg:w-[300px] flex-shrink-0 lg:mt-4">
              <ThreadNameBlock />
            </div>
          </div>
          {/* Footer */}
          <div className="border-2 justify-center text-center w-full h-[10vh]">
            FOOTER
          </div>
        </div>
      </div>
    </main>
  );
}

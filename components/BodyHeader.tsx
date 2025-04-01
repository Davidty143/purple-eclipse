import React from 'react';
import { Button } from '@/components/ui/button';

const BodyHeader = () => {
  return (
    <div className="p-body-header border-1 px-5 py-3 rounded-md">
      <div className="p-title text-lg font-semibold flex flex-row justify-between">
        <h1 className="p-title-value ">WELCOME TO VISCONN!</h1>
        <div className="ml-auto">
          <Button className="px-4 text-sm border bg-white text-black hover:bg-gray-100 transition-colors">Post Thread</Button>
        </div>
        <div className="v-quick-action"></div>
      </div>
      <div className="p-description text-sm text-gray-500 w-3/5">Visconn is a place to connect, share ideas, and join discussions. Engage with others through threads, comments, and more.</div>
    </div>
  );
};

export default BodyHeader;

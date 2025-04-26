import React from 'react';
import { MessageCircle } from 'lucide-react';

interface MessageHeaderProps {
  username: string;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ username }) => {
  return (
    <div className="flex pl-2 items-center space-x-2">
      <MessageCircle className="w-6 h-6 text-[#267858]" />
      <h1 className="text-lg font-semibold">{username}</h1>
    </div>
  );
};

export default MessageHeader;

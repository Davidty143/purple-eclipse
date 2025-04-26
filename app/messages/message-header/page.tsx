import React from 'react';

interface MessageHeaderProps {
  username: string;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ username }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{username}</h1>
    </div>
  );
};

export default MessageHeader;

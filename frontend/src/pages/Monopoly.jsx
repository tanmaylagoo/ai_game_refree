import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';

const Monopoly = () => {
  return (
    <div className="flex justify-center items-stretch h-[calc(100vh-4rem)] p-4 md:p-6">
      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[75%] max-w-[1200px] min-w-0">
        <ChatWindow gameId="monopoly" />
      </div>
    </div>
  );
};

export default Monopoly;

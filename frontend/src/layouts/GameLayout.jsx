import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';

const GameLayout = ({ children, gameId }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-4rem)] p-4 overflow-hidden">
      {/* Game Panel */}
      <div className="flex-1 lg:flex-[3] overflow-y-auto rounded-2xl pr-1 custom-scroll">
        {children}
      </div>
      {/* Chat Panel */}
      <div className="lg:flex-[3] min-w-[340px] max-w-full lg:max-w-[560px] h-full flex flex-col items-center justify-center">
        <ChatWindow gameId={gameId} />
      </div>
    </div>
  );
};

export default GameLayout;

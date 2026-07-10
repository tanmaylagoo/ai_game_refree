import React from 'react';
import ChatWindow from '../components/chat/ChatWindow';

const GameLayout = ({ children, gameId }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-4rem)] p-4 overflow-hidden">
      {/* Game Panel */}
      <div className="flex-1 lg:flex-[3] overflow-y-auto rounded-2xl pr-1 custom-scroll">
        {children}
      </div>
      {/* Chat Panel - centered and responsive */}
      <div className="flex-1 max-w-[1100px] w-10/12 md:w-8/12 mx-auto flex flex-col items-center justify-center">
        <ChatWindow gameId={gameId} />
      </div>
    </div>
  );
};

export default GameLayout;

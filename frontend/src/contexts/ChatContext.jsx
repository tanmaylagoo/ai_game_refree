import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chatHistories, setChatHistories] = useState({
    chess: [],
    uno: [],
    monopoly: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((gameId, message) => {
    setChatHistories((prev) => ({
      ...prev,
      [gameId]: [
        ...prev[gameId],
        {
          ...message,
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    }));
  }, []);

  const clearChat = useCallback((gameId) => {
    setChatHistories((prev) => ({
      ...prev,
      [gameId]: [],
    }));
  }, []);

  const getMessages = useCallback(
    (gameId) => chatHistories[gameId] || [],
    [chatHistories]
  );

  return (
    <ChatContext.Provider
      value={{ chatHistories, addMessage, clearChat, getMessages, isLoading, setIsLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};

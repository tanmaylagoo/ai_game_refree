import React, { createContext, useContext, useState, useCallback } from 'react';

const MonopolySessionContext = createContext();

export const useMonopolySession = () => {
  const context = useContext(MonopolySessionContext);
  if (!context)
    throw new Error('useMonopolySession must be used within MonopolySessionProvider');
  return context;
};

export const MonopolySessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(null);
  const [gameState, setGameState] = useState({
    players: {},
    properties: {},
    current_turn: '',
  });

  const updateSession = useCallback((id, state) => {
    setSessionId(id);
    if (state) setGameState(state);
  }, []);

  const updateGameState = useCallback((state) => {
    setGameState(state);
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setGameState({ players: {}, properties: {}, current_turn: '' });
  }, []);

  return (
    <MonopolySessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        gameState,
        setGameState,
        updateSession,
        updateGameState,
        clearSession,
      }}
    >
      {children}
    </MonopolySessionContext.Provider>
  );
};

import api from './api';

export const createSession = async (gameState) => {
  const response = await api.post('/api/monopoly/create', {
    game_state: gameState,
  });
  return response.data;
};

export const makeMove = async (sessionId, userQuery) => {
  const response = await api.post('/api/monopoly/move', {
    session_id: sessionId,
    user_query: userQuery,
  });
  return response.data;
};

export const getSession = async (sessionId) => {
  const response = await api.get(`/api/monopoly/${sessionId}`);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await api.delete(`/api/monopoly/${sessionId}`);
  return response.data;
};

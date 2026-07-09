import api from './api';

export const queryChess = async (userQuery, fen) => {
  const response = await api.post('/api/chat/query', {
    game_id: 'chess',
    user_query: userQuery,
    game_state: { fen },
  });
  return response.data;
};

export const queryUNO = async (userQuery, gameState) => {
  const response = await api.post('/api/chat/query', {
    game_id: 'uno',
    user_query: userQuery,
    game_state: gameState,
  });
  return response.data;
};

export const queryGameChat = async (gameId, userQuery, gameState = {}) => {
  const response = await api.post('/api/chat/query', {
    game_id: gameId,
    user_query: userQuery,
    game_state: gameState,
  });
  return response.data;
};

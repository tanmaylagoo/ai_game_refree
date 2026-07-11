import React from 'react';
import { useChessGame } from '../../hooks/useChessGame';
import { ChessBoard } from '../vision-chess/ChessBoard';

const ChessBoardPanel = () => {
  const game = useChessGame();

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <ChessBoard game={game} />
    </div>
  );
};

export default ChessBoardPanel;

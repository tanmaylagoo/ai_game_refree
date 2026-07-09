import React from 'react';
import { Crown } from 'lucide-react';
import GameLayout from '../layouts/GameLayout';
import PageHeader from '../components/ui/PageHeader';
import ChessBoardPanel from '../components/chess/ChessBoardPanel';

const Chess = () => {
  return (
    <GameLayout gameId="chess">
      <PageHeader title="Chess Referee" subtitle="Drag pieces to make moves. The AI validates every move." icon={Crown} />
      <ChessBoardPanel />
    </GameLayout>
  );
};

export default Chess;

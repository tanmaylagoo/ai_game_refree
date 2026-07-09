import React from 'react';
import { Layers } from 'lucide-react';
import GameLayout from '../layouts/GameLayout';
import PageHeader from '../components/ui/PageHeader';
import UnoGamePanel from '../components/uno/UnoGamePanel';

const Uno = () => {
  return (
    <GameLayout gameId="uno">
      <PageHeader title="UNO Referee" subtitle="Play cards and get instant rule validation from the AI." icon={Layers} />
      <UnoGamePanel />
    </GameLayout>
  );
};

export default Uno;

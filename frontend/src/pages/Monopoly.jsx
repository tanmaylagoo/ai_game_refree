import React from 'react';
import { Building2 } from 'lucide-react';
import GameLayout from '../layouts/GameLayout';
import PageHeader from '../components/ui/PageHeader';


const Monopoly = () => {
  return (
    <GameLayout gameId="monopoly">
      <PageHeader title="Monopoly Referee" subtitle="Chat with the AI Referee for Monopoly assistance." icon={Building2} />

    </GameLayout>
  );
};

export default Monopoly;

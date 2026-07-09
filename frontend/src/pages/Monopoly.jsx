import React from 'react';
import { Building2 } from 'lucide-react';
import GameLayout from '../layouts/GameLayout';
import PageHeader from '../components/ui/PageHeader';
import SessionCreator from '../components/monopoly/SessionCreator';
import MonopolyDashboard from '../components/monopoly/MonopolyDashboard';
import { useMonopolySession } from '../contexts/MonopolySessionContext';

const Monopoly = () => {
  const { sessionId, updateSession } = useMonopolySession();

  const handleSessionCreated = (id, state) => {
    updateSession(id, state);
  };

  return (
    <GameLayout gameId="monopoly">
      <PageHeader title="Monopoly Referee" subtitle="Create sessions and manage your Monopoly game with AI assistance." icon={Building2} />
      {sessionId ? <MonopolyDashboard /> : <SessionCreator onSessionCreated={handleSessionCreated} />}
    </GameLayout>
  );
};

export default Monopoly;

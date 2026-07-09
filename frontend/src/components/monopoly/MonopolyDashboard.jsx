import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, ShoppingCart, DollarSign, ArrowRight, Landmark, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMonopolySession } from '../../contexts/MonopolySessionContext';
import { useChat } from '../../contexts/ChatContext';
import { makeMove, getSession, deleteSession } from '../../services/monopolyService';
import PlayerCard from './PlayerCard';
import PropertyCard from './PropertyCard';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const MonopolyDashboard = () => {
  const { sessionId, gameState, updateGameState, clearSession } = useMonopolySession();
  const { addMessage, setIsLoading } = useChat();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [propertyName, setPropertyName] = useState('');

  const handleBuyProperty = async () => {
    if (!propertyName.trim()) return toast.error('Enter a property name');
    setIsProcessing(true);
    setIsLoading(true);
    addMessage('monopoly', { role: 'user', content: `Buy: **${propertyName}**` });

    try {
      const response = await makeMove(sessionId, `buy ${propertyName}`);
      if (response.engine_validation?.legal === false) {
        toast.error(response.engine_validation?.reason || 'Cannot buy');
        addMessage('monopoly', {
          role: 'ai',
          content: `❌ **Cannot Buy**\n\n${response.decision || response.engine_validation?.reason}`,
        });
      } else {
        if (response.updated_state) updateGameState(response.updated_state);
        toast.success('Property purchased!');
        addMessage('monopoly', { role: 'ai', content: response.decision || 'Purchase successful.' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed');
      addMessage('monopoly', { role: 'ai', content: `⚠️ **Error**: ${err.message}` });
    } finally {
      setIsProcessing(false);
      setIsLoading(false);
      setShowBuyModal(false);
      setPropertyName('');
    }
  };

  const handleRefresh = async () => {
    try {
      const data = await getSession(sessionId);
      if (data.game_state) updateGameState(data.game_state);
      toast.success('Session refreshed');
    } catch (err) {
      toast.error('Failed to refresh');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSession(sessionId);
      clearSession();
      toast.success('Session deleted');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const players = gameState?.players || {};
  const properties = gameState?.properties || {};

  return (
    <div className="space-y-5 relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-cosmic-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <LoadingSpinner size="lg" text="AI Referee is reviewing..." />
        </div>
      )}

      {/* Session Info */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-cosmic-300">Session</span>
          <p className="text-sm text-cosmic-50 font-mono">{sessionId?.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-cosmic-200">Turn: <strong className="text-neon-purple">{gameState?.current_turn}</strong></span>
          <button onClick={handleRefresh} className="p-2 rounded-lg text-cosmic-300 hover:text-cosmic-50 hover:bg-white/[0.04] transition-all">
            <RefreshCw size={15} />
          </button>
          <button onClick={handleDelete} className="p-2 rounded-lg text-cosmic-300 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Players */}
      <div>
        <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider mb-3">Players</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(players).map(([name, data]) => (
            <PlayerCard
              key={name}
              name={name}
              balance={data.balance || 0}
              properties={data.properties || []}
              isCurrent={gameState?.current_turn === name}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider mb-3">Actions</h3>
        {showBuyModal ? (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="Property name (e.g. Park Place)"
              className="flex-1 px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none focus:border-neon-purple/30"
              onKeyDown={(e) => e.key === 'Enter' && handleBuyProperty()}
            />
            <Button variant="primary" size="sm" onClick={handleBuyProperty} isLoading={isProcessing}>Buy</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBuyModal(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowBuyModal(true)}>
              <ShoppingCart size={14} /> Buy Property
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <DollarSign size={14} /> Pay Rent
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <ArrowRight size={14} /> End Turn
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <Landmark size={14} /> Mortgage
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <ArrowLeftRight size={14} /> Trade
            </Button>
          </div>
        )}
      </div>

      {/* Properties */}
      {Object.keys(properties).length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider mb-3">Properties</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(properties).map(([name, data]) => (
              <PropertyCard key={name} name={name} owner={data.owner} price={data.price} color={data.color} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonopolyDashboard;

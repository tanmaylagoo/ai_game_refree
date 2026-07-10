import React, { useState } from 'react';
import { motion } from 'framer-motion';

import toast from 'react-hot-toast';
import { useMonopolySession } from '../../contexts/MonopolySessionContext';
import { useChat } from '../../contexts/ChatContext';
import { makeMove } from '../../services/monopolyService';

import PropertyCard from './PropertyCard';

import LoadingSpinner from '../ui/LoadingSpinner';

const MonopolyDashboard = () => {
  const { sessionId, gameState, updateGameState } = useMonopolySession();
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
      // Directly accept the move without validation
      if (response.updated_state) updateGameState(response.updated_state);
      toast.success('Property purchased!');
      addMessage('monopoly', { role: 'ai', content: response.decision || 'Purchase successful.' });
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

  
  const properties = gameState?.properties || {};

  return (
    <div className="space-y-5 relative">






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

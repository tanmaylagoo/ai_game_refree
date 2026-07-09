import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Users, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { createSession } from '../../services/monopolyService';
import Button from '../ui/Button';

const SessionCreator = ({ onSessionCreated }) => {
  const [players, setPlayers] = useState([
    { name: 'Alice', balance: 1500 },
    { name: 'Bob', balance: 1500 },
  ]);
  const [currentTurn, setCurrentTurn] = useState('Alice');
  const [isCreating, setIsCreating] = useState(false);

  const addPlayer = () => {
    if (players.length >= 6) return toast.error('Maximum 6 players');
    setPlayers((prev) => [...prev, { name: `Player ${prev.length + 1}`, balance: 1500 }]);
  };

  const removePlayer = (index) => {
    if (players.length <= 2) return toast.error('Minimum 2 players');
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePlayer = (index, field, value) => {
    setPlayers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: field === 'balance' ? Number(value) || 0 : value } : p))
    );
  };

  const handleCreate = async () => {
    if (players.some((p) => !p.name.trim())) return toast.error('All players need names');
    setIsCreating(true);
    try {
      const playersObj = {};
      players.forEach((p) => {
        playersObj[p.name] = { name: p.name, balance: p.balance, position: 0, properties: [] };
      });
      
      // Seed the properties so they can be purchased
      const initialProperties = {
        "Park Place": { name: "Park Place", price: 350, owner: null },
        "Boardwalk": { name: "Boardwalk", price: 400, owner: null },
        "Mediterranean Avenue": { name: "Mediterranean Avenue", price: 60, owner: null },
        "Baltic Avenue": { name: "Baltic Avenue", price: 60, owner: null }
      };

      const gameState = { players: playersObj, properties: initialProperties, current_turn: currentTurn || players[0].name };
      const response = await createSession(gameState);
      toast.success('Session created!');
      onSessionCreated(response.session_id, gameState);
    } catch (err) {
      toast.error(err.message || 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 max-w-lg mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
          <Users size={20} className="text-neon-purple" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-cosmic-50 font-[family-name:var(--font-accent)]">Create Session</h2>
          <p className="text-xs text-cosmic-300">Set up players and starting balances</p>
        </div>
      </div>

      {/* Players */}
      <div className="space-y-3">
        {players.map((player, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="text"
              value={player.name}
              onChange={(e) => updatePlayer(i, 'name', e.target.value)}
              placeholder="Player name"
              className="flex-1 px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none focus:border-neon-purple/30"
            />
            <input
              type="number"
              value={player.balance}
              onChange={(e) => updatePlayer(i, 'balance', e.target.value)}
              className="w-24 px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none focus:border-neon-purple/30"
            />
            <button
              onClick={() => removePlayer(i)}
              className="p-2 rounded-lg text-cosmic-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Minus size={14} />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addPlayer}>
          <Plus size={14} /> Add Player
        </Button>
      </div>

      {/* Current Turn */}
      <div>
        <label className="text-xs text-cosmic-300 mb-1 block">First Turn</label>
        <select
          value={currentTurn}
          onChange={(e) => setCurrentTurn(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none"
        >
          {players.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={handleCreate} isLoading={isCreating}>
        <Play size={16} /> Create Session
      </Button>
    </motion.div>
  );
};

export default SessionCreator;

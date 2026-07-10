import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, RotateCcw, Palette, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../../contexts/ChatContext';
import { queryUNO } from '../../services/chatService';
import UnoCard from './UnoCard';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const parseCard = (cardStr) => {
  if (cardStr === 'Wild' || cardStr === 'Wild-Draw4') return { color: cardStr, value: cardStr };
  const parts = cardStr.split('-');
  return { color: parts[0], value: parts.slice(1).join('-') };
};

const COLORS = ['Red', 'Blue', 'Green', 'Yellow'];

const UnoGamePanel = () => {
  const [currentCard, setCurrentCard] = useState('Blue-7');
  const [currentColor, setCurrentColor] = useState('Blue');
  const [playerHand, setPlayerHand] = useState(['Red-5', 'Wild', 'Blue-2', 'Green-3', 'Yellow-Skip']);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [newCardInput, setNewCardInput] = useState('');
  const [editCardColor, setEditCardColor] = useState('Red');
  const [editCardValue, setEditCardValue] = useState('0');
  const { addMessage, setIsLoading } = useChat();

  const currentParsed = parseCard(currentCard);

  const playCard = async () => {
    if (selectedIndex === null) return;
    const card = playerHand[selectedIndex];
    setIsThinking(true);
    setIsLoading(true);

    addMessage('uno', { role: 'user', content: `Played: **${card}**` });

    // Directly accept the played card without validation
    const parsed = parseCard(card);
    setCurrentCard(card);
    setCurrentColor(parsed.color === 'Wild' || parsed.color === 'Wild-Draw4' ? currentColor : parsed.color);
    setPlayerHand((prev) => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
    toast.success('Card played!');
    addMessage('uno', { role: 'ai', content: 'Move accepted.' });
    setIsThinking(false);
    setIsLoading(false);
  };

  const addCard = () => {
    const card = newCardInput.trim();
    if (!card) return;
    setPlayerHand((prev) => [...prev, card]);
    setNewCardInput('');
    toast.success(`Added ${card}`);
  };

  const removeSelected = () => {
    if (selectedIndex === null) return;
    setPlayerHand((prev) => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  const resetHand = () => {
    setPlayerHand(['Red-5', 'Wild', 'Blue-2', 'Green-3', 'Yellow-Skip']);
    setCurrentCard('Blue-7');
    setCurrentColor('Blue');
    setSelectedIndex(null);
    toast.success('Hand reset');
  };

  const changeCurrentCard = () => {
    const card = `${editCardColor}-${editCardValue}`;
    setCurrentCard(card);
    setCurrentColor(editCardColor);
    toast.success(`Current card set to ${card}`);
  };

  return (
    <div className="space-y-6 relative">
      {isThinking && (
        <div className="absolute inset-0 bg-cosmic-900/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-20">
          <LoadingSpinner size="lg" text="AI Referee is reviewing..." />
        </div>
      )}

      {/* Current Card */}
      <div className="glass-card p-6 flex flex-col items-center gap-4">
        <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider">Current Card</h3>
        <UnoCard color={currentParsed.color} value={currentParsed.value} size="lg" />
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border border-white/20"
            style={{ backgroundColor: currentColor === 'Wild' ? '#a855f7' : ({ Red: '#ef4444', Blue: '#3b82f6', Green: '#22c55e', Yellow: '#eab308' }[currentColor] || '#a855f7') }}
          />
          <span className="text-sm text-cosmic-200">Current Color: <strong className="text-cosmic-50">{currentColor}</strong></span>
        </div>
      </div>

      {/* Player Hand */}
      <div className="glass-card p-6">
        <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider mb-4">Your Hand</h3>
        <div className="flex flex-wrap gap-3 justify-center min-h-[120px]">
          {playerHand.length === 0 ? (
            <p className="text-cosmic-300 text-sm">No cards in hand</p>
          ) : (
            playerHand.map((card, i) => {
              const parsed = parseCard(card);
              return (
                <UnoCard
                  key={`${card}-${i}`}
                  color={parsed.color}
                  value={parsed.value}
                  size="md"
                  isSelected={selectedIndex === i}
                  onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Play Button */}
      <div className="flex justify-center">
        <Button variant="primary" size="lg" onClick={playCard} disabled={selectedIndex === null || isThinking}>
          <Send size={16} /> Play Selected Card
        </Button>
      </div>

      {/* Controls */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-xs font-semibold text-cosmic-200 uppercase tracking-wider">Controls</h3>

        {/* Add Card */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCardInput}
            onChange={(e) => setNewCardInput(e.target.value)}
            placeholder="e.g. Red-7, Wild, Blue-Skip"
            className="flex-1 px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 placeholder:text-cosmic-300/40 outline-none focus:border-neon-purple/30"
          />
          <Button variant="secondary" size="sm" onClick={addCard}>
            <Plus size={14} /> Add
          </Button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={removeSelected} disabled={selectedIndex === null}>
            <Minus size={14} /> Remove
          </Button>
          <Button variant="secondary" size="sm" onClick={resetHand}>
            <RotateCcw size={14} /> Reset
          </Button>
        </div>

        {/* Change Current Card */}
        <div className="pt-3 border-t border-white/[0.04]">
          <h4 className="text-xs text-cosmic-300 mb-2">Change Current Card</h4>
          <div className="flex gap-2 items-center">
            <select
              value={editCardColor}
              onChange={(e) => setEditCardColor(e.target.value)}
              className="px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none"
            >
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="Wild">Wild</option>
            </select>
            <input
              type="text"
              value={editCardValue}
              onChange={(e) => setEditCardValue(e.target.value)}
              placeholder="Value"
              className="w-20 px-3 py-2 rounded-xl bg-cosmic-800/60 border border-white/[0.06] text-sm text-cosmic-50 outline-none"
            />
            <Button variant="secondary" size="sm" onClick={changeCurrentCard}>
              <Palette size={14} /> Set
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnoGamePanel;

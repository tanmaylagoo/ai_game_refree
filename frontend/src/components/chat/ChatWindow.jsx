import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Trash2, MessageSquare } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ChatMessage from './ChatMessage';
import LoadingSpinner from '../ui/LoadingSpinner';

const ChatWindow = ({ gameId }) => {
  const { getMessages, addMessage, clearChat, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const messages = getMessages(gameId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (providedQuery) => {
    const query = providedQuery ?? input.trim();
    if (!query || isLoading) return;
    addMessage(gameId, { role: 'user', content: query });
    setInput('');

    // Only query backend if not just local
    setIsLoading(true);
    try {
      const { queryGameChat } = await import('../../services/chatService.js');
      const response = await queryGameChat(gameId, query);
      addMessage(gameId, { role: 'ai', content: response.decision || response.message || response.response || response.engine_validation?.reason || 'Move processed.' });
    } catch (err) {
      addMessage(gameId, { role: 'ai', content: `⚠️ **Error**: ${err.message || 'Could not reach AI Referee'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass-panel rounded-2xl w-full h-full flex flex-col overflow-hidden">
      {/* Header with title */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
        <div className="text-center w-full">
          <h1 className="text-2xl font-bold text-cosmic-50">
            {gameId === 'uno' ? 'UNO Rules Assistant' : gameId === 'monopoly' ? 'Monopoly Rules Assistant' : 'AI Referee'}
          </h1>
          <p className="mt-1 text-sm text-cosmic-300">
            {gameId === 'uno'
              ? 'Ask any question about official UNO rules and gameplay.'
              : gameId === 'monopoly'
              ? 'Ask anything about Monopoly rules, properties, auctions, mortgages, rent, or gameplay.'
              : 'Chat with the AI Referee'}
          </p>
        </div>
        <button
          onClick={() => clearChat(gameId)}
          className="p-1.5 rounded-lg text-cosmic-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          aria-label="Clear chat"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 py-6 space-y-5">
        {/* Empty State with suggestions */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-5">
            {gameId === 'uno' ? (
              <>
                <div className="text-6xl">🃏</div>
                <h2 className="text-2xl font-semibold text-cosmic-50">UNO Rules Assistant</h2>
                <p className="text-base text-cosmic-300">Ask anything about the official UNO rulebook.</p>
                <p className="text-sm text-cosmic-400 mt-1">Example questions</p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {['Can I stack Draw Two cards?', 'When can I play a Wild Draw Four?', 'What happens if someone forgets to say UNO?', 'Can I end the game using a Wild card?'].map((q) => (
                    <button
                      key={q}
                      className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm hover:bg-neon-purple/30 transition"
                      onClick={() => handleSend(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            ) : gameId === 'monopoly' ? (
              <>
                <div className="text-6xl">🏠</div>
                <h2 className="text-2xl font-semibold text-cosmic-50">Monopoly Rules Assistant</h2>
                <p className="text-base text-cosmic-300">Ask anything about the official Monopoly rulebook.</p>
                <p className="text-sm text-cosmic-400 mt-1">Example questions</p>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {['Can I collect rent while in jail?', 'How do auctions work?', 'Can I mortgage a property with houses?', 'When can I build hotels?'].map((q) => (
                    <button
                      key={q}
                      className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-sm hover:bg-neon-purple/30 transition"
                      onClick={() => handleSend(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-cosmic-300">Make a move to start the conversation</p>
            )}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
        {isLoading && (
          <LoadingSpinner size="sm" text="AI Referee is reviewing your move..." />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 md:px-10 pb-5 pt-3 border-t border-white/[0.04]">
        <div className="flex items-center gap-3 bg-cosmic-800/60 rounded-2xl px-5 py-2 border border-white/[0.06] focus-within:border-neon-purple/30 transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI Referee..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-base text-cosmic-50 placeholder:text-cosmic-300/50 outline-none py-2.5 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-neon-purple flex items-center justify-center text-white disabled:opacity-30 hover:bg-neon-purple/80 transition-all duration-200 flex-shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

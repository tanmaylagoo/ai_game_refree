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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const query = input.trim();
    addMessage(gameId, { role: 'user', content: query });
    setInput('');
    
    // Only query backend if not just local
    setIsLoading(true);
    try {
      // Dynamic import to avoid circular dependencies if any, or just import at top
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
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neon-purple/10 flex items-center justify-center">
            <Bot size={16} className="text-neon-purple" />
          </div>
          <span className="text-sm font-semibold text-cosmic-50 font-[family-name:var(--font-accent)]">AI Referee</span>
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-50">
            <MessageSquare size={36} className="text-cosmic-300" />
            <p className="text-sm text-cosmic-300">Make a move to start the conversation</p>
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
      <div className="px-4 pb-4 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 bg-cosmic-800/60 rounded-full px-4 py-1.5 border border-white/[0.06] focus-within:border-neon-purple/30 transition-all duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI Referee..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-cosmic-50 placeholder:text-cosmic-300/50 outline-none py-2 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-neon-purple flex items-center justify-center text-white disabled:opacity-30 hover:bg-neon-purple/80 transition-all duration-200 flex-shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

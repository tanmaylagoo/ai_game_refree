import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatMessage = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isAI = message.role === 'ai';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      {isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-lg shadow-neon-purple/20">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div className={`group relative max-w-[80%] ${
        isAI
          ? 'glass-card p-4 border-l-2 border-l-neon-purple/40'
          : 'bg-gradient-to-r from-neon-purple/80 to-neon-blue/80 text-white p-4 rounded-2xl rounded-br-md'
      }`}>
        <div className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-cosmic-900/80 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_strong]:text-cosmic-50">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/[0.04]">
          <span className="text-[10px] text-cosmic-300">{message.timestamp}</span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-cosmic-300 hover:text-cosmic-50 p-1 rounded"
            aria-label="Copy message"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      {!isAI && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
          <User size={16} className="text-cosmic-200" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;

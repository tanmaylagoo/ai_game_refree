import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Rocket } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-neon-purple/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-blue/[0.04] blur-[120px] pointer-events-none" />

      {/* Floating Rocket */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <Rocket size={48} className="text-neon-purple/60" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-8xl font-bold text-gradient-purple font-[family-name:var(--font-accent)] mb-4"
      >
        404
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-semibold text-cosmic-50 mb-2 font-[family-name:var(--font-accent)]"
      >
        Lost in Space
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-cosmic-200 text-center max-w-sm mb-8"
      >
        The page you are looking for has drifted into the cosmic void.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium shadow-lg shadow-neon-purple/20 hover:shadow-neon-purple/40 transition-all duration-300"
        >
          <Home size={18} />
          Return Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;

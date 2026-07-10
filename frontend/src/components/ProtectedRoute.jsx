import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-cosmic-900 starfield text-cosmic-100">
        <div className="relative flex items-center justify-center">
          {/* Glowing outer rings */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-neon-purple/20 animate-ping" />
          <div className="absolute w-12 h-12 rounded-full border border-neon-blue/30 animate-pulse" />
          <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
        </div>
        <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-gradient uppercase animate-pulse">
          Establishing Cosmic Link...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

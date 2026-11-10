import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-cosmic-900 starfield text-cosmic-100">
        <Loader2 className="w-10 h-10 text-neon-purple animate-spin" />
        <p className="mt-4 text-xs font-semibold text-cosmic-200">Loading...</p>
      </div>
    );
  }

  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;


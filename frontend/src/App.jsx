import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatProvider } from './contexts/ChatContext';
import { MonopolySessionProvider } from './contexts/MonopolySessionContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Chess from './pages/Chess';
import Uno from './pages/Uno';
import Monopoly from './pages/Monopoly';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import { useLocation } from 'react-router-dom';
import StarfieldBackground from './components/ui/StarfieldBackground';

const Layout = () => {
  const location = useLocation();
  const isGameRoute = ['/chess', '/uno', '/monopoly', '/about'].includes(location.pathname);
  const isHome = location.pathname === '/';

  return (
    <div className="flex h-screen bg-cosmic-900 overflow-hidden" style={{ background: '#050516' }}>
      {/* Global animated starfield */}
      <StarfieldBackground />
      {/* Sidebar — sits above starfield */}
      {isGameRoute && <div style={{ position: 'relative', zIndex: 10 }}><Sidebar /></div>}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen ${isGameRoute ? 'ml-[260px]' : ''}`} style={{ position: 'relative', zIndex: 10 }}>
        {isHome ? null : <Navbar />}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chess" element={<Chess />} />
            <Route path="/uno" element={<Uno />} />
            <Route path="/monopoly" element={<Monopoly />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const AuthenticatedLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-cosmic-900 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-[260px] min-h-screen">
          <Navbar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/chess" element={<Chess />} />
              <Route path="/uno" element={<Uno />} />
              <Route path="/monopoly" element={<Monopoly />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <MonopolySessionProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/*" element={<AuthenticatedLayout />} />
              </Routes>

              {/* Toast Notifications */}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#0a0a2e',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.7)',
                  },
                  success: {
                    iconTheme: { primary: '#a855f7', secondary: '#f8fafc' },
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#f8fafc' },
                  },
                }}
              />
            </Router>
          </MonopolySessionProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
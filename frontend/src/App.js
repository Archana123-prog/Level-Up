import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import HabitsPage from './components/habits/HabitsPage';
import LeaderboardPage from './components/leaderboard/LeaderboardPage';
import RewardsPage from './components/rewards/RewardsPage';
import ProfilePage from './components/dashboard/ProfilePage';
import AuthPage from './components/auth/AuthPage';
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--dark-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '1.5rem'
  }}>
    <div style={{
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '2rem',
      fontWeight: 900,
      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>LEVELUP</div>
    <div style={{ display: 'flex', gap: '8px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 12, height: 12,
          borderRadius: '50%',
          background: 'var(--neon-purple)',
          animation: `bounce 0.8s ease-in-out ${i * 0.2}s infinite alternate`,
        }} />
      ))}
    </div>
    <style>{`
      @keyframes bounce {
        from { transform: translateY(0); opacity: 0.4; }
        to { transform: translateY(-16px); opacity: 1; }
      }
    `}</style>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="rewards" element={<RewardsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 26, 46, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0a0a0f' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

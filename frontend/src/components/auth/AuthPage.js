import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AVATAR_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9',
];

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login, register } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back, hero! 🎮');
      } else {
        if (!form.username || form.username.length < 3) {
          toast.error('Username must be at least 3 characters');
          return;
        }
        await register(form.username, form.email, form.password, selectedColor);
        toast.success('Your adventure begins! 🚀');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dark-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', top: '-10%', left: '-10%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float1 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: 350, height: 350,
        borderRadius: '50%', bottom: '-10%', right: '-10%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', animation: 'float2 10s ease-in-out infinite',
      }} />
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-20px) scale(1.05)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(1.08)} }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
        style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(26,26,46,0.9)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 24,
          padding: '2.5rem',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.1)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif', fontWeight: 900,
            fontSize: '2.25rem', letterSpacing: '0.05em',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>LEVELUP</div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Gamify Your Life
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, marginBottom: '1.75rem' }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '0.625rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em',
                textTransform: 'uppercase', transition: 'all 0.2s',
                background: mode === m ? 'linear-gradient(135deg, #7c3aed, #9d4edd)' : 'transparent',
                color: mode === m ? 'white' : '#64748b',
                boxShadow: mode === m ? '0 0 15px rgba(124,58,237,0.4)' : 'none',
              }}
            >{m === 'login' ? 'Sign In' : 'Sign Up'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div key="username"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Username</label>
                <input
                  name="username" value={form.username} onChange={handleChange}
                  placeholder="hero_name_123" required={mode === 'register'}
                  className="game-input"
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.95rem' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Email</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="hero@levelup.gg" required
              className="game-input"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Password</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" required
              className="game-input"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.95rem' }}
            />
          </div>

          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div key="color"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              >
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.6rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avatar Color</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map((color) => (
                    <button key={color} type="button" onClick={() => setSelectedColor(color)}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', background: color, border: 'none', cursor: 'pointer',
                        outline: selectedColor === color ? `3px solid white` : '3px solid transparent',
                        outlineOffset: 2, transform: selectedColor === color ? 'scale(1.2)' : 'scale(1)',
                        transition: 'all 0.15s', boxShadow: selectedColor === color ? `0 0 12px ${color}` : 'none',
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit" disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary"
            style={{
              width: '100%', padding: '0.875rem', borderRadius: 12,
              fontSize: '1rem', marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}
          >
            {loading ? 'Loading...' : mode === 'login' ? '⚔️  Enter the Arena' : '🚀  Start Your Quest'}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          {mode === 'login' ? "Don't have an account? " : "Already a hero? "}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

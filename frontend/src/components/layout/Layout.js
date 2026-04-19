import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { playSound, toggleSound, isSoundEnabled } from '../../utils/sounds';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⚡' },
  { path: '/habits', label: 'Habits', icon: '🎯' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { path: '/rewards', label: 'Rewards', icon: '💎' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) playSound('click');
  };

  const progress = user ? user.levelProgress ?? ((user.xp / user.xpForNextLevel) * 100) : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--dark-bg)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'rgba(18,18,26,0.95)', borderRight: '1px solid rgba(124,58,237,0.15)',
        padding: '1.5rem 1rem', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        backdropFilter: 'blur(20px)',
      }} className="hidden-mobile">

        {/* Logo */}
        <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
          <div style={{
            fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '1.4rem',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>LEVELUP</div>
          <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>
            Gamify Your Life
          </div>
        </div>

        {/* User mini-profile */}
        {user && (
          <div style={{
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 14, padding: '1rem', marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: user.avatarColor || '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'white',
                flexShrink: 0, boxShadow: `0 0 12px ${user.avatarColor || '#7c3aed'}60`,
              }}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700 }}>
                    LVL {user.level}
                  </span>
                  <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>🔥 {user.streak}</span>
                </div>
              </div>
            </div>
            {/* XP Bar */}
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>{user.xp} XP</span>
              <span>{user.xpForNextLevel} needed</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
              <div className="xp-bar" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => playSound('click')}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.875rem', borderRadius: 10, textDecoration: 'none',
                fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.95rem',
                letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.15s',
                background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.1))' : 'transparent',
                color: isActive ? '#a78bfa' : '#64748b',
                border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                boxShadow: isActive ? '0 0 15px rgba(124,58,237,0.15)' : 'none',
              })}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom controls */}
        <div style={{ borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSoundToggle}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: soundOn ? '#a78bfa' : '#475569', fontSize: '1rem', transition: 'all 0.15s',
            }}
            title={soundOn ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button
            onClick={handleLogout}
            style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', fontSize: '0.75rem', fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.15s',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', paddingBottom: '5rem' }} className="main-content">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(18,18,26,0.97)', borderTop: '1px solid rgba(124,58,237,0.2)',
        display: 'none', backdropFilter: 'blur(20px)',
        padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
      }} className="mobile-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => playSound('click')}
            style={({ isActive }) => ({
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              flex: 1, padding: '0.4rem 0', textDecoration: 'none',
              color: isActive ? '#a78bfa' : '#475569', fontSize: '1.25rem', transition: 'all 0.15s',
            })}
          >
            {item.icon}
            <span style={{ fontSize: '0.6rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

    </div>
  );
}

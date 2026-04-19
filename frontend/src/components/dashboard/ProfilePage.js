import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';

const ALL_BADGES = [
  { id: 'first_habit', name: 'First Step', description: 'Completed your first habit', icon: '🌱' },
  { id: 'streak_7', name: 'Week Warrior', description: '7 day streak', icon: '🔥' },
  { id: 'streak_30', name: 'Month Master', description: '30 day streak', icon: '⚡' },
  { id: 'level_5', name: 'Rising Star', description: 'Reached level 5', icon: '⭐' },
  { id: 'level_10', name: 'Veteran', description: 'Reached level 10', icon: '💎' },
  { id: 'habits_50', name: 'Half Century', description: 'Completed 50 habits', icon: '🏆' },
  { id: 'habits_100', name: 'Centurion', description: 'Completed 100 habits', icon: '👑' },
];

const AVATAR_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', avatarColor: user?.avatarColor || '#7c3aed' });
  const [saving, setSaving] = useState(false);

  const unlockedBadgeIds = user?.badges?.map((b) => b.id) || [];
  const progress = user ? Math.min((user.xp / user.xpForNextLevel) * 100, 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(form);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Level', value: user?.level || 1, icon: '⚔️', color: '#a78bfa' },
    { label: 'Total XP', value: (user?.totalXp || 0).toLocaleString(), icon: '⚡', color: '#06b6d4' },
    { label: 'Current Streak', value: `${user?.streak || 0}d`, icon: '🔥', color: '#f59e0b' },
    { label: 'Best Streak', value: `${user?.longestStreak || 0}d`, icon: '🏅', color: '#ec4899' },
    { label: 'Habits Done', value: user?.totalHabitsCompleted || 0, icon: '✅', color: '#10b981' },
    { label: 'Coins', value: user?.coins || 0, icon: '💎', color: '#f59e0b' },
  ];

  return (
    <div className="page-container">
      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 24, padding: '2rem', marginBottom: '1.5rem',
          backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${user?.avatarColor || '#7c3aed'}20 0%, transparent 70%)`, filter: 'blur(40px)' }} />

        <div className="profile-hero-inner" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: editing ? form.avatarColor : (user?.avatarColor || '#7c3aed'),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '2rem', color: 'white',
              boxShadow: `0 0 30px ${user?.avatarColor || '#7c3aed'}60`,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'rgba(26,26,46,0.9)', border: '2px solid rgba(124,58,237,0.4)',
              borderRadius: '50%', width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '0.6rem', color: '#a78bfa',
            }}>
              {user?.level}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="game-input"
                style={{ width: '100%', padding: '0.5rem 0.875rem', borderRadius: 10, fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }} />
            ) : (
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', color: '#e2e8f0', margin: '0 0 0.25rem' }}>
                {user?.username}
              </h2>
            )}
            <div style={{ color: '#64748b', fontSize: '0.85rem', fontFamily: 'Rajdhani, sans-serif', marginBottom: '0.75rem' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                ⚔️ Level {user?.level}
              </span>
              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 99, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                🔥 {user?.streak} day streak
              </span>
            </div>
          </div>

          <div className="profile-hero-actions">
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={saving}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: editing ? 'linear-gradient(135deg, #7c3aed, #9d4edd)' : 'rgba(124,58,237,0.15)',
              color: editing ? 'white' : '#a78bfa',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
            }}
          >{saving ? '...' : editing ? '✓ Save' : '✏️ Edit'}</button>
          </div>
        </div>

        {editing && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avatar Color</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, avatarColor: c })} type="button"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                    outline: form.avatarColor === c ? '3px solid white' : '3px solid transparent',
                    outlineOffset: 2, transform: form.avatarColor === c ? 'scale(1.2)' : 'scale(1)',
                    transition: 'all 0.15s', boxShadow: form.avatarColor === c ? `0 0 12px ${c}` : 'none',
                  }} />
              ))}
            </div>
            <button onClick={() => setEditing(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(124,58,237,0.3)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Cancel
            </button>
          </div>
        )}

        {/* XP progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'Rajdhani, sans-serif' }}>{user?.xp} / {user?.xpForNextLevel} XP</span>
            <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
            <motion.div className="xp-bar" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} />
          </div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.3rem' }}>
            {Math.max(0, (user?.xpForNextLevel || 0) - (user?.xp || 0))} XP to Level {(user?.level || 0) + 1}
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        className="profile-stats"
      >
        {stats.map((s, i) => (
          <motion.div key={s.label} whileHover={{ y: -3 }}
            style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 14, padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{s.icon}</div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '1.5rem' }}>
        <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0', margin: '0 0 1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Achievements ({unlockedBadgeIds.length}/{ALL_BADGES.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {ALL_BADGES.map((badge) => {
            const unlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <motion.div key={badge.id} whileHover={unlocked ? { scale: 1.05 } : {}}
                style={{
                  background: unlocked ? 'rgba(124,58,237,0.12)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${unlocked ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 14, padding: '1rem', textAlign: 'center',
                  opacity: unlocked ? 1 : 0.4, transition: 'all 0.2s',
                  filter: unlocked ? 'none' : 'grayscale(100%)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: unlocked ? '#e2e8f0' : '#475569', marginBottom: '0.25rem' }}>{badge.name}</div>
                <div style={{ fontSize: '0.65rem', color: '#475569', lineHeight: 1.4 }}>{badge.description}</div>
                {unlocked && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#10b981', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>✓ Unlocked</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
}

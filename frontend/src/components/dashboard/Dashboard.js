import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { habitsAPI, challengesAPI } from '../../utils/api';
import { playSound } from '../../utils/sounds';
import { showXPFloat, triggerConfetti, particleBurst } from '../../utils/animations';

const CATEGORY_COLORS = {
  Health: '#10b981', Fitness: '#f59e0b', Study: '#06b6d4',
  Mindfulness: '#8b5cf6', Productivity: '#ec4899', Social: '#ef4444',
  Finance: '#84cc16', Creative: '#f97316', Other: '#94a3b8',
};

const StatCard = ({ label, value, sub, icon, color = '#7c3aed' }) => (
  <motion.div
    whileHover={{ y: -3 }}
    style={{
      background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(124,58,237,0.15)',
      borderRadius: 16, padding: '1.25rem', backdropFilter: 'blur(20px)',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span>
    </div>
    <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.75rem', color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.3rem' }}>{sub}</div>}
  </motion.div>
);

const LevelUpModal = ({ newLevel, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}
    onClick={onClose}
  >
    <motion.div
      className="level-up-anim levelup-modal-inner"
      style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(6,182,212,0.9))',
        border: '2px solid rgba(255,255,255,0.2)', borderRadius: 24,
        padding: '3rem 4rem', textAlign: 'center',
        boxShadow: '0 0 60px rgba(124,58,237,0.6), 0 0 120px rgba(6,182,212,0.3)',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '1rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
        Level Up!
      </div>
      <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '4rem', color: 'white', lineHeight: 1 }}>
        {newLevel}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '1rem', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>
        You've reached a new level!
      </div>
      <button onClick={onClose} style={{
        marginTop: '1.5rem', padding: '0.75rem 2rem', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)',
        background: 'rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
        fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.1em', textTransform: 'uppercase',
      }}>Continue</button>
    </motion.div>
  </motion.div>
);

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [stats, setStats] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [loadingHabit, setLoadingHabit] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, challengesRes, statsRes] = await Promise.all([
        habitsAPI.getAll(),
        challengesAPI.daily(),
        habitsAPI.stats(),
      ]);
      setHabits(habitsRes.data.habits);
      setChallenges(challengesRes.data.challenges);
      setStats(statsRes.data);
    } catch {
      toast.error('Failed to load data');
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComplete = async (habit, e) => {
    if (habit.completedToday) return;
    setLoadingHabit(habit._id);

    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const res = await habitsAPI.complete(habit._id);
      const { xpEarned, leveled, newLevel, user: updatedUser, newBadges } = res.data;

      playSound('habitComplete');
      setTimeout(() => playSound('xpGain'), 300);

      showXPFloat(xpEarned, rect.left + rect.width / 2, rect.top);
      particleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

      setHabits((prev) =>
        prev.map((h) => h._id === habit._id ? { ...h, completedToday: true } : h)
      );
      updateUser(updatedUser);

      if (leveled) {
        setTimeout(() => {
          triggerConfetti();
          playSound('levelUp');
          setLevelUpData(newLevel);
        }, 600);
      }

      if (newBadges?.length > 0) {
        setTimeout(() => {
          playSound('badgeUnlocked');
          newBadges.forEach((b) => toast.success(`🏅 Badge unlocked: ${b.name}`));
        }, 1000);
      }

      toast.success(`✅ +${xpEarned} XP earned!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to complete habit');
    } finally {
      setLoadingHabit(null);
    }
  };

  const handleClaimChallenge = async (challenge) => {
    try {
      const res = await challengesAPI.claim(challenge._id);
      playSound('challengeComplete');
      toast.success(`⚡ +${res.data.xpEarned} XP — Challenge complete!`);
      setChallenges((prev) => prev.map((c) => c._id === challenge._id ? { ...c, completed: true } : c));
      updateUser(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot claim yet');
    }
  };

  const todayHabits = habits.filter((h) => h.frequency === 'daily' || h.targetDays?.includes(new Date().getDay()));
  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const progress = user ? Math.min((user.xp / user.xpForNextLevel) * 100, 100) : 0;

  return (
    <div className="page-container">
      <AnimatePresence>
        {levelUpData && (
          <LevelUpModal newLevel={levelUpData} onClose={() => setLevelUpData(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', color: '#e2e8f0', margin: 0 }}>
          Welcome back, <span style={{ background: 'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.username}</span>
        </h1>
        <p style={{ color: '#475569', margin: '0.3rem 0 0', fontFamily: 'Rajdhani, sans-serif', fontSize: '1rem' }}>
          {completedCount}/{todayHabits.length} habits completed today
          {user?.streak > 0 && <span style={{ marginLeft: '0.75rem', color: '#f59e0b' }}>🔥 {user.streak} day streak</span>}
        </p>
      </motion.div>

      {/* XP Bar hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="xp-hero-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: user?.avatarColor || '#7c3aed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: 'white',
              boxShadow: `0 0 20px ${user?.avatarColor || '#7c3aed'}80`,
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Level</div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '2rem', color: '#a78bfa', lineHeight: 1 }}>
                {user?.level}
              </div>
            </div>
          </div>
          <div className="xp-right" style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', color: '#64748b', fontSize: '0.8rem' }}>Total XP</div>
            <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, color: '#06b6d4', fontSize: '1.25rem' }}>
              {(user?.totalXp || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.xp} / {user?.xpForNextLevel} XP</span>
          <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <motion.div
            className="xp-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.4rem' }}>
          {user ? Math.max(0, user.xpForNextLevel - user.xp) : 0} XP to Level {(user?.level || 0) + 1}
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
        className="stats-grid"
      >
        <StatCard label="Streak" value={user?.streak || 0} sub="days" icon="🔥" color="#f59e0b" />
        <StatCard label="Today" value={`${completedCount}/${todayHabits.length}`} sub="habits" icon="✅" color="#10b981" />
        <StatCard label="Coins" value={user?.coins || 0} sub="earned" icon="💎" color="#06b6d4" />
        <StatCard label="Badges" value={user?.badges?.length || 0} sub="unlocked" icon="🏅" color="#ec4899" />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', minWidth: 0 }} className="main-grid">
        {/* Today's Habits */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0', margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Today's Habits
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#475569' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayHabits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', background: 'rgba(26,26,46,0.5)', borderRadius: 16, border: '1px dashed rgba(124,58,237,0.2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif' }}>No habits yet. Add some!</div>
              </div>
            ) : todayHabits.map((habit, i) => (
              <motion.div
                key={habit._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: habit.completedToday
                    ? 'rgba(16,185,129,0.08)'
                    : 'rgba(26,26,46,0.8)',
                  border: `1px solid ${habit.completedToday ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: 14, padding: '0.875rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  cursor: habit.completedToday ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: loadingHabit === habit._id ? 0.6 : 1,
                }}
                whileHover={habit.completedToday ? {} : { x: 4, borderColor: 'rgba(124,58,237,0.4)' }}
                onClick={(e) => !habit.completedToday && handleComplete(habit, e)}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: habit.completedToday ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.15)',
                  border: `2px solid ${habit.completedToday ? '#10b981' : 'rgba(124,58,237,0.4)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', transition: 'all 0.2s',
                }}>
                  {habit.completedToday ? '✓' : habit.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: '0.9rem', color: habit.completedToday ? '#10b981' : '#e2e8f0',
                    textDecoration: habit.completedToday ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{habit.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: `${CATEGORY_COLORS[habit.category] || '#94a3b8'}20`, color: CATEGORY_COLORS[habit.category] || '#94a3b8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                      {habit.category}
                    </span>
                    {habit.currentStreak > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#f59e0b' }}>🔥 {habit.currentStreak}</span>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'Orbitron, sans-serif', color: '#a78bfa', fontWeight: 700 }}>
                  +{10 + Math.floor((user?.streak || 0) / 7) * 5}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Daily Challenges */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
          <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e2e8f0', margin: '0 0 1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Daily Challenges ⚡
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {challenges.map((challenge, i) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                style={{
                  background: challenge.completed ? 'rgba(124,58,237,0.08)' : 'rgba(26,26,46,0.8)',
                  border: `1px solid ${challenge.completed ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: 14, padding: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{challenge.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: challenge.completed ? '#a78bfa' : '#e2e8f0' }}>{challenge.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem' }}>{challenge.description}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '0.8rem', color: '#a78bfa', fontWeight: 700 }}>+{challenge.xpReward}</div>
                    <div style={{ fontSize: '0.65rem', color: '#f59e0b' }}>💎 {challenge.coinReward}</div>
                  </div>
                </div>
                {!challenge.completed && (
                  <button
                    onClick={() => handleClaimChallenge(challenge)}
                    style={{
                      marginTop: '0.75rem', width: '100%', padding: '0.5rem',
                      borderRadius: 8, cursor: 'pointer',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))',
                      border: '1px solid rgba(124,58,237,0.4)',
                      color: '#a78bfa', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                      fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase',
                      transition: 'all 0.15s',
                    }}
                  >
                    Claim Reward
                  </button>
                )}
                {challenge.completed && (
                  <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#10b981', fontSize: '0.8rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                    ✓ Completed
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Badges preview */}
          {user?.badges?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#94a3b8', margin: '0 0 0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recent Badges</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {user.badges.slice(-6).map((badge) => (
                  <div key={badge.id} className="tooltip" style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', cursor: 'default',
                  }}>
                    {badge.icon}
                    <span className="tooltip-text">{badge.name}: {badge.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}

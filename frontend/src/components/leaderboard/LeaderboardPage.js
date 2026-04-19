import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { leaderboardAPI } from '../../utils/api';

const RANK_COLORS = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
const RANK_ICONS = { 1: '👑', 2: '🥈', 3: '🥉' };

function UserRow({ entry, index }) {
  const rankColor = RANK_COLORS[entry.rank] || '#64748b';
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '0.875rem 1.25rem', borderRadius: 14,
        background: entry.isCurrentUser
          ? 'rgba(124,58,237,0.12)'
          : entry.rank <= 3 ? 'rgba(26,26,46,0.9)' : 'rgba(26,26,46,0.5)',
        border: `1px solid ${entry.isCurrentUser ? 'rgba(124,58,237,0.5)' : entry.rank <= 3 ? `${rankColor}30` : 'rgba(124,58,237,0.1)'}`,
        marginBottom: '0.5rem',
        boxShadow: entry.rank === 1 ? '0 0 20px rgba(255,215,0,0.1)' : entry.isCurrentUser ? '0 0 15px rgba(124,58,237,0.1)' : 'none',
      }}
    >
      {/* Rank */}
      <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
        {entry.rank <= 3
          ? <span style={{ fontSize: '1.3rem' }}>{RANK_ICONS[entry.rank]}</span>
          : <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: '#475569' }}>#{entry.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
        background: entry.avatarColor || '#7c3aed',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: 'white',
        boxShadow: entry.rank <= 3 ? `0 0 12px ${rankColor}60` : 'none',
      }}>
        {entry.username[0]?.toUpperCase()}
      </div>

      {/* User info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: entry.isCurrentUser ? '#a78bfa' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.username}
          </span>
          {entry.isCurrentUser && (
            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 99, background: 'rgba(124,58,237,0.3)', color: '#a78bfa', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, flexShrink: 0 }}>YOU</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>🔥 {entry.streak} streak</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>🏅 {entry.badgeCount} badges</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1rem', color: entry.rank <= 3 ? rankColor : '#a78bfa' }}>
          {(entry.totalXp || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'Rajdhani, sans-serif' }}>
          LVL {entry.level} · XP
        </div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState('global');
  const [globalData, setGlobalData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [g, w] = await Promise.all([leaderboardAPI.global(), leaderboardAPI.weekly()]);
        setGlobalData(g.data);
        setWeeklyData(w.data);
      } catch { toast.error('Failed to load leaderboard'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const data = tab === 'global' ? globalData : weeklyData;
  const entries = data?.leaderboard || [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="page-container rewards-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: '#e2e8f0', margin: '0 0 0.25rem' }}>Leaderboard</h1>
        <p style={{ color: '#475569', margin: '0 0 2rem', fontFamily: 'Rajdhani, sans-serif' }}>
          {data?.total ? `${data.total} heroes competing` : 'Compete with heroes worldwide'}
          {data?.currentUserRank && <span style={{ marginLeft: '0.75rem', color: '#a78bfa' }}>Your rank: #{data.currentUserRank}</span>}
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
        {[['global', '🌍 Global XP'], ['weekly', '🔥 Streak Kings']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em',
              background: tab === t ? 'linear-gradient(135deg, #7c3aed, #9d4edd)' : 'transparent',
              color: tab === t ? 'white' : '#64748b', transition: 'all 0.15s',
            }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>Loading...</div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="leaderboard-podium" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '0.75rem', marginBottom: '2rem', alignItems: 'end' }}>
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                const isCenter = i === 1; // 1st place
                const actualRank = isCenter ? 1 : i === 0 ? 2 : 3;
                const height = isCenter ? 180 : i === 0 ? 140 : 120;
                const color = RANK_COLORS[actualRank];
                
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                      height, position: 'relative', flex: 1, minWidth: 0,
                      background: `rgba(26,26,46,0.9)`, border: `1px solid ${color}40`,
                      borderRadius: 16, borderBottom: `3px solid ${color}`,
                      boxShadow: isCenter ? `0 0 30px ${color}30` : 'none',
                      padding: '1rem 0.5rem'
                    }}
                  >
                    <div style={{ fontSize: isCenter ? '1.5rem' : '1rem', marginBottom: '0.5rem' }}>{RANK_ICONS[actualRank]}</div>
                    <div style={{
                      width: isCenter ? 56 : 44, height: isCenter ? 56 : 44, borderRadius: '50%', margin: '0 auto 0.5rem',
                      background: entry?.avatarColor || '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: isCenter ? '1.1rem' : '0.875rem', color: 'white',
                      boxShadow: `0 0 15px ${color}80`,
                    }}>{entry?.username?.[0]?.toUpperCase()}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry?.username}</div>
                    <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '0.8rem', color, marginTop: '0.25rem' }}>
                      {(entry?.totalXp || 0).toLocaleString()} XP
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>Lv. {entry?.level}</div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div>
            {top3.map((entry, i) => <UserRow key={entry.id} entry={entry} index={i} />)}
            {rest.length > 0 && (
              <>
                <div style={{ height: 1, background: 'rgba(124,58,237,0.15)', margin: '1rem 0' }} />
                {rest.map((entry, i) => <UserRow key={entry.id} entry={entry} index={i + 3} />)}
              </>
            )}
          </div>

          {entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', background: 'rgba(26,26,46,0.5)', borderRadius: 16, border: '1px dashed rgba(124,58,237,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>Be the first on the leaderboard!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

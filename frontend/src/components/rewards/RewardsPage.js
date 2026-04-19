import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { rewardsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import { triggerConfetti } from '../../utils/animations';

const TYPE_LABELS = { theme: '🎨 Theme', cosmetic: '✨ Cosmetic', boost: '⚡ Boost' };
const TYPE_COLORS = { theme: '#8b5cf6', cosmetic: '#ec4899', boost: '#f59e0b' };

export default function RewardsPage() {
  const { user, updateUser } = useAuth();
  const [items, setItems] = useState([]);
  const [userCoins, setUserCoins] = useState(user?.coins || 0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await rewardsAPI.store();
        setItems(res.data.items);
        setUserCoins(res.data.userCoins);
      } catch { toast.error('Failed to load store'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handlePurchase = async (item) => {
    if (purchasing) return;
    setPurchasing(item.id);
    try {
      const res = await rewardsAPI.purchase(item.id);
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, owned: true } : i));
      setUserCoins(res.data.userCoins);
      updateUser({ coins: res.data.userCoins });
      playSound('badgeUnlocked');
      triggerConfetti();
      toast.success(`🎉 ${item.name} purchased!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div className="rewards-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#e2e8f0', margin: 0 }}>Reward Store</h1>
            <p style={{ color: '#475569', margin: '0.25rem 0 0', fontFamily: 'Rajdhani, sans-serif' }}>Spend your coins to unlock exclusive rewards</p>
          </div>
          <div style={{
            background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 14, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 0 15px rgba(245,158,11,0.1)',
          }}>
            <span style={{ fontSize: '1.25rem' }}>💎</span>
            <div>
              <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.25rem', color: '#f59e0b' }}>{userCoins}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'Rajdhani, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Coins</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* How to earn coins */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'Rajdhani, sans-serif' }}>
          <span style={{ fontWeight: 700, color: '#a78bfa' }}>Earn Coins: </span>
          Complete habits (+5 coins) • Gain XP (+1 coin per 2 XP) • Complete challenges • Level up bonuses
        </div>
      </motion.div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'theme', 'cosmetic', 'boost'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '0.35rem 0.875rem', borderRadius: 99, border: `1px solid ${filter === f ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
              background: filter === f ? 'rgba(124,58,237,0.2)' : 'transparent',
              color: filter === f ? '#a78bfa' : '#64748b', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
            }}>
            {f === 'all' ? 'All' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>Loading store...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{
                background: item.owned ? 'rgba(16,185,129,0.05)' : 'rgba(26,26,46,0.8)',
                border: `1px solid ${item.owned ? 'rgba(16,185,129,0.25)' : !item.canAfford ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.2)'}`,
                borderRadius: 18, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
              }}
              whileHover={!item.owned ? { y: -3, borderColor: 'rgba(124,58,237,0.4)' } : {}}
            >
              {item.owned && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 99, padding: '0.2rem 0.6rem',
                  fontSize: '0.65rem', color: '#10b981', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>Owned</div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: item.preview ? `${item.preview}25` : 'rgba(124,58,237,0.15)',
                  border: `1.5px solid ${item.preview || '#7c3aed'}50`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
                  boxShadow: item.preview ? `0 0 15px ${item.preview}40` : 'none',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</div>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 99,
                    background: `${TYPE_COLORS[item.type] || '#7c3aed'}20`, color: TYPE_COLORS[item.type] || '#a78bfa',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  }}>{TYPE_LABELS[item.type]}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{item.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>💎</span>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: item.canAfford || item.owned ? '#f59e0b' : '#ef4444' }}>
                    {item.cost}
                  </span>
                </div>
                <button
                  onClick={() => !item.owned && handlePurchase(item)}
                  disabled={item.owned || !item.canAfford || purchasing === item.id}
                  style={{
                    padding: '0.55rem 1.25rem', borderRadius: 10, border: 'none', cursor: item.owned || !item.canAfford ? 'not-allowed' : 'pointer',
                    fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                    letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s',
                    background: item.owned
                      ? 'rgba(16,185,129,0.15)'
                      : !item.canAfford
                        ? 'rgba(239,68,68,0.1)'
                        : 'linear-gradient(135deg, #7c3aed, #9d4edd)',
                    color: item.owned ? '#10b981' : !item.canAfford ? '#ef4444' : 'white',
                    opacity: purchasing === item.id ? 0.7 : 1,
                    boxShadow: !item.owned && item.canAfford ? '0 0 15px rgba(124,58,237,0.3)' : 'none',
                  }}
                >
                  {purchasing === item.id ? '...' : item.owned ? '✓ Owned' : !item.canAfford ? 'Need More 💎' : 'Purchase'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

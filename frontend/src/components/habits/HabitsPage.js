import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { habitsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { playSound } from '../../utils/sounds';
import { showXPFloat, particleBurst, triggerConfetti } from '../../utils/animations';

const CATEGORIES = ['Health', 'Fitness', 'Study', 'Mindfulness', 'Productivity', 'Social', 'Finance', 'Creative', 'Other'];
const ICONS = ['✨', '💪', '🧘', '📚', '🏃', '💧', '🥗', '🎯', '💰', '🎨', '📝', '🌿', '⚡', '🔥', '🎵', '🌅', '🤸', '📵', '💤', '🧠'];
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#0ea5e9', '#84cc16', '#f97316'];
const CATEGORY_COLORS = {
  Health: '#10b981', Fitness: '#f59e0b', Study: '#06b6d4', Mindfulness: '#8b5cf6',
  Productivity: '#ec4899', Social: '#ef4444', Finance: '#84cc16', Creative: '#f97316', Other: '#94a3b8',
};

const defaultForm = {
  name: '', description: '', category: 'Other', frequency: 'daily',
  icon: '✨', color: '#7c3aed', reminderTime: '',
};

function HabitForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || defaultForm);
  const [saving, setSaving] = useState(false);

  const handle = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Habit name is required'); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Name */}
      <div>
        <label style={labelStyle}>Habit Name *</label>
        <input value={form.name} onChange={(e) => handle('name', e.target.value)}
          placeholder="e.g. Morning Meditation" className="game-input"
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.95rem' }} required />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea value={form.description} onChange={(e) => handle('description', e.target.value)}
          placeholder="Optional description..." className="game-input" rows={2}
          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.95rem', resize: 'vertical' }} />
      </div>

      {/* Category & Frequency */}
      <div className="form-row-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={(e) => handle('category', e.target.value)}
            className="game-input" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem' }}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Frequency</label>
          <select value={form.frequency} onChange={(e) => handle('frequency', e.target.value)}
            className="game-input" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, fontSize: '0.875rem' }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <label style={labelStyle}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {ICONS.map((ic) => (
            <button key={ic} type="button" onClick={() => handle('icon', ic)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === ic ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
                background: form.icon === ic ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label style={labelStyle}>Color</label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {COLORS.map((color) => (
            <button key={color} type="button" onClick={() => handle('color', color)}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: color,
                outline: form.color === color ? '3px solid white' : '3px solid transparent',
                outlineOffset: 2, transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                transition: 'all 0.15s', boxShadow: form.color === color ? `0 0 12px ${color}` : 'none',
              }} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <button type="button" onClick={onCancel}
          style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1px solid rgba(124,58,237,0.3)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary"
          style={{ flex: 2, padding: '0.75rem', borderRadius: 10, fontSize: '0.95rem', opacity: saving ? 0.7 : 1, fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {saving ? 'Saving...' : initial ? '✏️  Update Habit' : '+ Create Habit'}
        </button>
      </div>
    </form>
  );
}

const labelStyle = {
  display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.4rem',
  fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
};

export default function HabitsPage() {
  const { updateUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [loadingHabit, setLoadingHabit] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('habits');

  const fetchHabits = useCallback(async () => {
    try {
      const res = await habitsAPI.getAll();
      setHabits(res.data.habits);
    } catch { toast.error('Failed to load habits'); }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await habitsAPI.suggestions();
      setSuggestions(res.data.suggestions);
    } catch {}
  }, []);

  useEffect(() => { fetchHabits(); fetchSuggestions(); }, [fetchHabits, fetchSuggestions]);

  const handleCreate = async (form) => {
    try {
      const res = await habitsAPI.create(form);
      setHabits((prev) => [...prev, res.data.habit]);
      setShowForm(false);
      playSound('click');
      toast.success(`🎯 "${form.name}" habit created!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create habit');
      throw err;
    }
  };

  const handleUpdate = async (form) => {
    try {
      const res = await habitsAPI.update(editingHabit._id, form);
      setHabits((prev) => prev.map((h) => h._id === editingHabit._id ? { ...res.data.habit, completedToday: h.completedToday } : h));
      setEditingHabit(null);
      toast.success('Habit updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await habitsAPI.delete(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      toast.success('Habit deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleComplete = async (habit, e) => {
    if (habit.completedToday) return;
    setLoadingHabit(habit._id);
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const res = await habitsAPI.complete(habit._id);
      const { xpEarned, leveled, user: updatedUser } = res.data;

      playSound('habitComplete');
      setTimeout(() => playSound('xpGain'), 300);
      showXPFloat(xpEarned, rect.left + rect.width / 2, rect.top);
      particleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

      setHabits((prev) => prev.map((h) => h._id === habit._id ? { ...h, completedToday: true, currentStreak: (h.currentStreak || 0) + 1 } : h));
      updateUser(updatedUser);

      if (leveled) { setTimeout(() => { triggerConfetti(); playSound('levelUp'); }, 600); }
      toast.success(`✅ +${xpEarned} XP!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setLoadingHabit(null);
    }
  };



  const filtered = filter === 'all' ? habits : filter === 'completed' ? habits.filter((h) => h.completedToday) : habits.filter((h) => !h.completedToday);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="habits-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', color: '#e2e8f0', margin: 0 }}>My Habits</h1>
          <p style={{ color: '#475569', margin: '0.25rem 0 0', fontFamily: 'Rajdhani, sans-serif' }}>
            {habits.length} habits · {habits.filter((h) => h.completedToday).length} done today
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
          onClick={() => { setShowForm(true); setEditingHabit(null); }}
          className="btn-primary"
          style={{ padding: '0.65rem 1.25rem', borderRadius: 12, fontSize: '0.9rem', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >+ New Habit</motion.button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 }}>
        {[['habits', '🎯 My Habits'], ['suggestions', '🤖 AI Suggestions']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '0.6rem', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em',
              background: activeTab === tab ? 'linear-gradient(135deg, #7c3aed, #9d4edd)' : 'transparent',
              color: activeTab === tab ? 'white' : '#64748b', transition: 'all 0.15s',
            }}>{label}</button>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showForm || editingHabit) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditingHabit(null); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ width: '100%', maxWidth: 520, background: 'rgba(22,22,36,0.98)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(124,58,237,0.15)' }}
            >
              <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#e2e8f0', margin: '0 0 1.5rem' }}>
                {editingHabit ? 'Edit Habit' : 'Create Habit'}
              </h2>
              <HabitForm
                initial={editingHabit ? { name: editingHabit.name, description: editingHabit.description || '', category: editingHabit.category, frequency: editingHabit.frequency, icon: editingHabit.icon, color: editingHabit.color, reminderTime: editingHabit.reminderTime || '' } : null}
                onSave={editingHabit ? handleUpdate : handleCreate}
                onCancel={() => { setShowForm(false); setEditingHabit(null); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits Tab */}
      {activeTab === 'habits' && (
        <>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {['all', 'pending', 'completed'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.875rem', borderRadius: 99, border: `1px solid ${filter === f ? '#7c3aed' : 'rgba(124,58,237,0.2)'}`,
                  background: filter === f ? 'rgba(124,58,237,0.2)' : 'transparent',
                  color: filter === f ? '#a78bfa' : '#64748b', cursor: 'pointer',
                  fontFamily: 'Rajdhani, sans-serif', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
                }}>{f}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            <AnimatePresence>
              {filtered.map((habit, i) => (
                <motion.div
                  key={habit._id}
                  layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: habit.completedToday ? 'rgba(16,185,129,0.07)' : 'rgba(26,26,46,0.8)',
                    border: `1px solid ${habit.completedToday ? 'rgba(16,185,129,0.25)' : 'rgba(124,58,237,0.15)'}`,
                    borderRadius: 16, padding: '1.25rem', transition: 'all 0.2s',
                  }}
                  whileHover={{ y: -2, borderColor: habit.completedToday ? 'rgba(16,185,129,0.4)' : 'rgba(124,58,237,0.35)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${habit.color}20`, border: `1.5px solid ${habit.color}50`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                      }}>{habit.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#e2e8f0', marginBottom: '0.2rem' }}>{habit.name}</div>
                        <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 99, background: `${CATEGORY_COLORS[habit.category] || '#94a3b8'}20`, color: CATEGORY_COLORS[habit.category] || '#94a3b8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>
                          {habit.category}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => setEditingHabit(habit)}
                        style={{ padding: '0.35rem 0.5rem', borderRadius: 7, border: '1px solid rgba(124,58,237,0.25)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s' }}>✏️</button>
                      <button onClick={() => handleDelete(habit._id)}
                        style={{ padding: '0.35rem 0.5rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.25)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.15s' }}>🗑️</button>
                    </div>
                  </div>

                  {habit.description && (
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 1rem', lineHeight: 1.5 }}>{habit.description}</p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#f59e0b' }}>{habit.currentStreak || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>Streak 🔥</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#a78bfa' }}>{habit.totalCompletions || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', fontFamily: 'Rajdhani, sans-serif' }}>Total ✅</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase' }}>
                      {habit.frequency}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleComplete(habit, e)}
                    disabled={habit.completedToday || loadingHabit === habit._id}
                    style={{
                      width: '100%', padding: '0.65rem', borderRadius: 10, cursor: habit.completedToday ? 'default' : 'pointer',
                      background: habit.completedToday
                        ? 'rgba(16,185,129,0.15)'
                        : `linear-gradient(135deg, ${habit.color}40, ${habit.color}20)`,
                      color: habit.completedToday ? '#10b981' : '#e2e8f0',
                      fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: '0.875rem',
                      letterSpacing: '0.05em', textTransform: 'uppercase', transition: 'all 0.2s',
                      border: `1px solid ${habit.completedToday ? 'rgba(16,185,129,0.3)' : `${habit.color}50`}`,
                    }}
                  >
                    {loadingHabit === habit._id ? '...' : habit.completedToday ? '✓ Done for Today' : `✓ Mark Complete (+10 XP)`}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#475569', background: 'rgba(26,26,46,0.5)', borderRadius: 16, border: '1px dashed rgba(124,58,237,0.2)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.1rem' }}>
                  {filter === 'all' ? 'No habits yet. Create your first one!' : `No ${filter} habits`}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {suggestions.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, padding: '1.25rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>{s.name}</div>
                  <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: 99, background: `${CATEGORY_COLORS[s.category] || '#94a3b8'}20`, color: CATEGORY_COLORS[s.category] || '#94a3b8', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600 }}>{s.category}</span>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{s.description}</p>
              <p style={{ fontSize: '0.78rem', color: '#06b6d4', margin: '0 0 1rem' }}>💡 {s.reason}</p>
              <button
                onClick={() => {
                  setShowForm(true);
                  setActiveTab('habits');
                }}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 10, cursor: 'pointer',
                  background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
                  color: '#06b6d4', fontFamily: 'Rajdhani, sans-serif', fontWeight: 600,
                  fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
                }}
              >+ Add This Habit</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

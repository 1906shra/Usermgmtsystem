import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileApi } from '../api/users.api';
import toast from 'react-hot-toast';

/* Compute days since a date */
const daysSince = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/* Avatar color palette by initials */
const AVATAR_COLORS = [
  '#7c6af7', '#00d4aa', '#f59e0b', '#ef4444',
  '#06b6d4', '#10b981', '#8b5cf6', '#ec4899',
];
const avatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { icon: '✅', title: 'Account active', desc: 'Your account is in good standing', color: '#22c55e' },
    { icon: '📩', title: 'Welcome to UserMS', desc: 'Your account has been created', color: '#06b6d4' },
    { icon: '🛡️', title: `Role: ${user?.role || 'user'}`, desc: 'Your current permission level', color: '#7c6af7' },
    { icon: '🔐', title: 'Secure session', desc: 'JWT authentication is active', color: '#f59e0b' },
    { icon: '🔔', title: 'Notifications enabled', desc: 'You will be notified of changes', color: '#ec4899' },
  ]);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getProfileApi();
      setProfile(data.data.user);
    } catch {
      // silently continue with user from context
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const me = profile || user;
  const initials =
    me?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const lastLogin = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const daysActive = daysSince(me?.createdAt);
  const memberSince = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = [
    {
      icon: '📅',
      iconBg: 'rgba(124,106,247,0.18)',
      value: typeof daysActive === 'number' ? daysActive : '—',
      label: 'Days Active',
      sub: '↑ 12 this month',
      subColor: '#22c55e',
      orbColor: 'rgba(124,106,247,0.25)',
    },
    {
      icon: '📤',
      iconBg: 'rgba(0,212,170,0.15)',
      value: '38',
      label: 'Files Uploaded',
      sub: '↑ 5 new files',
      subColor: '#22c55e',
      orbColor: 'rgba(0,212,170,0.2)',
    },
    {
      icon: '💾',
      iconBg: 'rgba(245,158,11,0.15)',
      value: '4.2 GB',
      label: 'Storage Used',
      sub: '⚠ 84% of limit',
      subColor: '#f59e0b',
      orbColor: 'rgba(245,158,11,0.2)',
    },
    {
      icon: '🔗',
      iconBg: 'rgba(236,72,153,0.15)',
      value: '7',
      label: 'Linked Apps',
      sub: '↑ 2 this week',
      subColor: '#22c55e',
      orbColor: 'rgba(236,72,153,0.2)',
    },
  ];

  const activities = [
    { dot: '#22c55e', text: 'Signed in successfully', time: 'Just now' },
    { dot: '#06b6d4', text: 'Profile loaded from database', time: 'Just now' },
    { dot: '#7c6af7', text: 'Account verified on registration', time: memberSince },
    { dot: '#f59e0b', text: 'JWT token refreshed', time: '5 min ago' },
    { dot: '#ec4899', text: 'Session started', time: lastLogin },
  ];

  return (
    <div className="page">
      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">My Dashboard</h1>
          <p className="dash-sub">
            Welcome back, {me?.name?.split(' ')[0]} 👋 — Last login: Today {lastLogin}
          </p>
        </div>
        <div className="dash-actions">
          <button className="dash-notif-btn" onClick={() => toast('Feature coming soon', { icon: '🔔' })}>
            🔔
            <span className="dash-notif-dot"></span>
          </button>
          <button className="btn-edit-profile" onClick={() => navigate('/profile')}>
            Edit Profile
          </button>
          <button className="btn-upgrade" onClick={() => toast('Upgrade coming soon!', { icon: '⭐' })}>
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div className="dash-stat-card" key={i}>
            <div className="dash-stat-orb" style={{ background: s.orbColor }} />
            <div
              className="dash-stat-icon-wrap"
              style={{ background: s.iconBg }}
            >
              {s.icon}
            </div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-sub" style={{ color: s.subColor }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Profile card ── */}
      <div className="dash-profile-card">
        <div className="dash-profile-left">
          <div
            className="dash-profile-avatar"
            style={{ background: `linear-gradient(135deg, ${avatarColor(me?.name || '')}, #7c6af7)` }}
          >
            {initials}
          </div>
          <div className="dash-profile-info">
            <div className="dash-profile-name">{me?.name}</div>
            <div className="dash-profile-email">{me?.email}</div>
            <div className="dash-profile-badges">
              <span className="badge-active-dot">● Active</span>
              <span className="dash-plan-badge">Free Plan</span>
            </div>
          </div>
        </div>
        <div className="dash-profile-stats">
          <div className="dash-pstat">
            <span className="dash-pstat-val">3</span>
            <span className="dash-pstat-lbl">Projects</span>
          </div>
          <div className="dash-pstat">
            <span className="dash-pstat-val">21</span>
            <span className="dash-pstat-lbl">Connections</span>
          </div>
          <div className="dash-pstat">
            <span className="dash-pstat-val">98%</span>
            <span className="dash-pstat-lbl">Profile</span>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="dash-grid">
        {/* Recent Activity */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Recent Activity</span>
            <button
              className="dash-card-link"
              onClick={() => toast('Feature coming soon', { icon: '📋' })}
            >
              View all →
            </button>
          </div>
          <div className="dash-activity-list">
            {activities.map((a, i) => (
              <div className="dash-activity-item" key={i}>
                <div
                  className="dash-activity-dot"
                  style={{ background: a.dot }}
                />
                <div className="dash-activity-text">{a.text}</div>
                <div className="dash-activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Notifications</span>
            <button
              className="dash-card-link"
              onClick={() => setNotifications([])}
            >
              Clear all
            </button>
          </div>
          <div className="dash-notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text3)', fontSize: '0.83rem' }}>
                No notifications
              </div>
            ) : (
              notifications.map((n, i) => (
                <div className="dash-notif-item" key={i}>
                  <div
                    className="dash-notif-icon"
                    style={{ background: n.color + '22', color: n.color }}
                  >
                    {n.icon}
                  </div>
                  <div>
                    <div className="dash-notif-title">{n.title}</div>
                    <div className="dash-notif-desc">{n.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Account Details</span>
            <button className="dash-card-link" onClick={() => navigate('/profile')}>
              Edit →
            </button>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{me?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value" style={{ fontSize: '0.8rem' }}>{me?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className={`badge badge-${me?.role}`}>{me?.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className={`badge badge-${me?.status}`}>{me?.status}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value" style={{ fontSize: '0.8rem' }}>
                {me?.createdAt
                  ? new Date(me.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Active Sessions</span>
            <button className="dash-card-link" onClick={handleLogout}>
              Revoke all
            </button>
          </div>
          <div className="dash-session-list">
            <div className="dash-session-item">
              <div className="dash-session-icon">💻</div>
              <div className="dash-session-info">
                <div className="dash-session-name">Current Browser</div>
                <div className="dash-session-meta">Active now · This device</div>
              </div>
              <span className="dash-session-live">● Live</span>
            </div>
          </div>
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(124,106,247,0.06)',
              borderRadius: 'var(--r)',
              border: '1px solid rgba(124,106,247,0.15)',
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
              🔐 Your session is secured with JWT authentication. Tokens expire automatically.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

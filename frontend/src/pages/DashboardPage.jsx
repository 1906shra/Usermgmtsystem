import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileApi } from '../api/users.api';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileApi()
      .then(r => setProfile(r.data.data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
  const lastLogin = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const stats = [
    { icon: '📅', value: '—',   label: 'Days Active',     sub: '↑ Member since ' + (user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'), color: '#7c3aed' },
    { icon: '📤', value: '—',   label: 'Files Uploaded',  sub: '↑ No files yet',    color: '#06b6d4' },
    { icon: '💾', value: '—',   label: 'Storage Used',    sub: '— of limit',        color: '#f59e0b' },
    { icon: '🔗', value: '1',   label: 'Active Sessions', sub: '↑ Current session', color: '#10b981' },
  ];

  const activities = [
    { dot: '#10b981', text: 'Signed in successfully', time: 'Just now' },
    { dot: '#06b6d4', text: 'Profile loaded from database', time: 'Just now' },
    { dot: '#7c3aed', text: 'Account verified on registration', time: memberSince },
  ];

  const notifications = [
    { icon: '✅', title: 'Account active', desc: 'Your account is in good standing', color: '#10b981' },
    { icon: '📩', title: 'Welcome to UserMS', desc: 'Your account has been created', color: '#06b6d4' },
    { icon: '🛡️', title: `Role: ${user?.role}`, desc: 'Your current permission level', color: '#7c3aed' },
    { icon: '🔐', title: 'Secure session', desc: 'JWT authentication is active', color: '#f59e0b' },
  ];

  return (
    <div className="page">
      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <div>
          <h1 className="dash-title">My Dashboard</h1>
          <p className="dash-sub">Welcome back, {user?.name?.split(' ')[0]} 👋 — Last login: Today {lastLogin}</p>
        </div>
        <div className="dash-actions">
          <button className="dash-notif-btn">
            🔔
            <span className="dash-notif-dot"></span>
          </button>
          <Link to="/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dash-stats">
        {stats.map((s, i) => (
          <div className="dash-stat-card" key={i} style={{ '--accent-color': s.color }}>
            <div className="dash-stat-orb" style={{ background: s.color + '22' }}></div>
            <div className="dash-stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-sub" style={{ color: s.color }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Profile card ── */}
      <div className="dash-profile-card">
        <div className="dash-profile-left">
          <div className="dash-profile-avatar">{initials}</div>
          <div className="dash-profile-info">
            <div className="dash-profile-name">{user?.name}</div>
            <div className="dash-profile-email">{user?.email}</div>
            <div className="dash-profile-badges">
              <span className={`badge badge-${user?.status}`}>● {user?.status}</span>
              <span className="dash-plan-badge">Free Plan</span>
            </div>
          </div>
        </div>
        <div className="dash-profile-stats">
          <div className="dash-pstat">
            <span className="dash-pstat-val">1</span>
            <span className="dash-pstat-lbl">Sessions</span>
          </div>
          <div className="dash-pstat">
            <span className="dash-pstat-val">—</span>
            <span className="dash-pstat-lbl">Connections</span>
          </div>
          <div className="dash-pstat">
            <span className="dash-pstat-val">100%</span>
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
            <button className="dash-card-link">View all →</button>
          </div>
          <div className="dash-activity-list">
            {activities.map((a, i) => (
              <div className="dash-activity-item" key={i}>
                <div className="dash-activity-dot" style={{ background: a.dot }}></div>
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
            <button className="dash-card-link">Clear all</button>
          </div>
          <div className="dash-notif-list">
            {notifications.map((n, i) => (
              <div className="dash-notif-item" key={i}>
                <div className="dash-notif-icon" style={{ background: n.color + '22', color: n.color }}>{n.icon}</div>
                <div>
                  <div className="dash-notif-title">{n.title}</div>
                  <div className="dash-notif-desc">{n.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Account Details</span>
            <Link to="/profile" className="dash-card-link">Edit →</Link>
          </div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{user?.name}</span></div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value" style={{ fontSize: '0.82rem' }}>{user?.email}</span></div>
            <div className="info-row"><span className="info-label">Role</span><span className={`badge badge-${user?.role}`}>{user?.role}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className={`badge badge-${user?.status}`}>{user?.status}</span></div>
            <div className="info-row"><span className="info-label">Member Since</span><span className="info-value" style={{ fontSize: '0.8rem' }}>{memberSince}</span></div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="dash-card-title">Active Sessions</span>
            <button className="dash-card-link" onClick={handleLogout}>Revoke all</button>
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
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(124,58,237,0.06)', borderRadius: 'var(--radius)', border: '1px solid rgba(124,58,237,0.15)' }}>
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

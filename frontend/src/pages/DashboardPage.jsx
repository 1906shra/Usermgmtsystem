import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileApi } from '../api/users.api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfileApi().then(r => setProfile(r.data.data.user)).catch(() => {});
  }, []);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="page">
      {/* Top bar */}
      <div className="ud-topbar">
        <div>
          <h1 className="ud-title">My Dashboard</h1>
          <p className="ud-sub">Welcome back, {user?.name?.split(' ')[0]} 👋 — Last login: Today</p>
        </div>
        <div className="ud-topbar-actions">
          <Link to="/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="ud-stats">
        {[
          { icon: '📅', value: '—',    label: 'Days Active',     sub: 'Member since ' + (user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—') },
          { icon: '🛡️', value: user?.role?.toUpperCase() || '—', label: 'Account Role', sub: 'Current permission level' },
          { icon: '✅', value: user?.status === 'active' ? 'Active' : 'Inactive', label: 'Account Status', sub: 'Account standing' },
          { icon: '🔗', value: '1',    label: 'Active Sessions', sub: 'Current session' },
        ].map((s, i) => (
          <div className="ud-stat-card" key={i}>
            <div className="ud-stat-icon">{s.icon}</div>
            <div className="ud-stat-value">{s.value}</div>
            <div className="ud-stat-label">{s.label}</div>
            <div className="ud-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="ud-grid">
        {/* Profile card */}
        <div className="ud-card ud-profile-card">
          <div className="ud-profile-avatar">{initials}</div>
          <div className="ud-profile-info">
            <div className="ud-profile-name">{user?.name}</div>
            <div className="ud-profile-email">{user?.email}</div>
            <div className="ud-profile-badges">
              <span className={`badge badge-${user?.status}`}>{user?.status}</span>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <div className="ud-profile-stats">
            <div className="ud-pstat"><span className="ud-pstat-val">1</span><span className="ud-pstat-lbl">Session</span></div>
            <div className="ud-pstat"><span className="ud-pstat-val">100%</span><span className="ud-pstat-lbl">Profile</span></div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="ud-card">
          <div className="ud-card-header">
            <span className="ud-card-title">Recent Activity</span>
            <Link to="/profile" className="ud-card-link">View all →</Link>
          </div>
          <div className="ud-activity-list">
            {[
              { icon: '🔐', text: 'Signed in successfully', time: 'Just now' },
              { icon: '👤', text: 'Profile loaded', time: 'Just now' },
              { icon: '✅', text: 'Account verified', time: 'On registration' },
            ].map((a, i) => (
              <div className="ud-activity-item" key={i}>
                <div className="ud-activity-icon">{a.icon}</div>
                <div className="ud-activity-text">{a.text}</div>
                <div className="ud-activity-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="ud-card">
          <div className="ud-card-header">
            <span className="ud-card-title">Notifications</span>
            <button className="ud-card-link">Clear all</button>
          </div>
          <div className="ud-notif-list">
            {[
              { icon: '✅', title: 'Account active', desc: 'Your account is in good standing' },
              { icon: '🔐', title: 'Secure login', desc: 'JWT authentication enabled' },
              { icon: '🛡️', title: `Role: ${user?.role}`, desc: 'Your current permission level' },
            ].map((n, i) => (
              <div className="ud-notif-item" key={i}>
                <div className="ud-notif-icon">{n.icon}</div>
                <div>
                  <div className="ud-notif-title">{n.title}</div>
                  <div className="ud-notif-desc">{n.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Details */}
        <div className="ud-card">
          <div className="ud-card-header">
            <span className="ud-card-title">Account Details</span>
            <Link to="/profile" className="ud-card-link">Edit →</Link>
          </div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">Full Name</span><span className="info-value">{user?.name}</span></div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value" style={{ fontSize: '0.82rem' }}>{user?.email}</span></div>
            <div className="info-row"><span className="info-label">Role</span><span className={`badge badge-${user?.role}`}>{user?.role}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className={`badge badge-${user?.status}`}>{user?.status}</span></div>
            <div className="info-row"><span className="info-label">Member Since</span><span className="info-value" style={{ fontSize: '0.8rem' }}>{fmt(user?.createdAt)}</span></div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="ud-card">
          <div className="ud-card-header">
            <span className="ud-card-title">Active Sessions</span>
          </div>
          <div className="ud-session-list">
            <div className="ud-session-item">
              <div className="ud-session-icon">💻</div>
              <div className="ud-session-info">
                <div className="ud-session-name">Current Browser</div>
                <div className="ud-session-meta">Active now</div>
              </div>
              <span className="ud-session-badge live">● Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

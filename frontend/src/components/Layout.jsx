import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, onClick, badge, badgeColor }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/admin' || to === '/dashboard'}
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    <span className="nav-icon">{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge !== undefined && (
      <span
        className="nav-badge"
        style={{
          background:
            badgeColor === 'red'
              ? 'var(--danger)'
              : badgeColor === 'yellow'
              ? 'var(--warning)'
              : 'var(--primary)',
        }}
      >
        {badge}
      </span>
    )}
  </NavLink>
);

/* Nav item that shows toast instead of navigating */
const ToastNavItem = ({ icon, label, badge, badgeColor, onClick }) => (
  <button
    className="nav-link"
    style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}
    onClick={onClick}
  >
    <span className="nav-icon">{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge !== undefined && (
      <span
        className="nav-badge"
        style={{
          background:
            badgeColor === 'red'
              ? 'var(--danger)'
              : badgeColor === 'yellow'
              ? 'var(--warning)'
              : 'var(--primary)',
        }}
      >
        {badge}
      </span>
    )}
  </button>
);

const Layout = () => {
  const { user, logout, isAdmin, isAdminOrManager } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const close = () => setSidebarOpen(false);
  const comingSoon = () => { toast('Feature coming soon', { icon: '🚀' }); close(); };
  const initials =
    user?.name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">UserMS</span>
          {isAdmin && <span className="sidebar-admin-tag">ADMIN</span>}
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            /* ── ADMIN SIDEBAR ── */
            <>
              <span className="nav-section-label">Control Panel</span>
              <NavItem to="/admin" icon="⊞" label="Overview" onClick={close} />
              <NavItem to="/users" icon="👥" label="User Management" onClick={close} />
              <ToastNavItem icon="🛡️" label="Roles & Permissions" onClick={comingSoon} />
              <ToastNavItem icon="📊" label="Analytics" onClick={comingSoon} />

              <span className="nav-section-label">System</span>
              <ToastNavItem icon="🔔" label="Alerts" badge={4} badgeColor="red" onClick={comingSoon} />
              <ToastNavItem icon="📋" label="Audit Log" onClick={comingSoon} />
              <ToastNavItem icon="⚙️" label="System Settings" onClick={comingSoon} />
              <ToastNavItem icon="⛔" label="Banned Users" badge={2} badgeColor="red" onClick={comingSoon} />
            </>
          ) : isAdminOrManager ? (
            /* ── MANAGER SIDEBAR ── */
            <>
              <span className="nav-section-label">Main</span>
              <NavItem to="/admin" icon="⊞" label="Overview" onClick={close} />
              <NavItem to="/users" icon="👥" label="Users" onClick={close} />

              <span className="nav-section-label">Account</span>
              <NavItem to="/profile" icon="👤" label="My Profile" onClick={close} />
              <ToastNavItem icon="🔔" label="Notifications" badge={3} onClick={comingSoon} />
            </>
          ) : (
            /* ── USER SIDEBAR ── */
            <>
              <span className="nav-section-label">Main</span>
              <NavItem to="/dashboard" icon="⊞" label="Dashboard" onClick={close} />
              <NavItem to="/profile" icon="👤" label="My Profile" onClick={close} />
              <ToastNavItem icon="✉️" label="Messages" badge={3} onClick={comingSoon} />
              <ToastNavItem icon="📁" label="My Files" onClick={comingSoon} />

              <span className="nav-section-label">Account</span>
              <ToastNavItem icon="🔔" label="Notifications" badge={5} badgeColor="yellow" onClick={comingSoon} />
              <ToastNavItem icon="🛡️" label="Security" onClick={comingSoon} />
              <ToastNavItem icon="⚙️" label="Settings" onClick={comingSoon} />
            </>
          )}
        </nav>

        {/* User info at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">
                {user?.role === 'admin'
                  ? 'Administrator'
                  : user?.role === 'manager'
                  ? 'Manager'
                  : 'Member'}
              </div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            ↩ Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 49,
          }}
          onClick={close}
        />
      )}

      {/* ── Main ── */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(p => !p)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
          <div className="topbar-right">
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <div className="topbar-avatar">{initials}</div>
            <span className="topbar-name">{user?.name}</span>
            <button className="topbar-logout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

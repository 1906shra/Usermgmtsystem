import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, onClick, badge }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
  >
    <span className="nav-icon">{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span style={{
        fontSize: '0.62rem', fontWeight: 700, padding: '0.15rem 0.45rem',
        background: 'linear-gradient(135deg,#d97706,#b45309)',
        borderRadius: '999px', color: 'white', letterSpacing: '0.04em',
      }}>{badge}</span>
    )}
  </NavLink>
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

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚡</div>
          <span className="sidebar-logo-text">UserMS</span>
        </div>

        <nav className="sidebar-nav">

          {/* Admin sees Admin Panel as home */}
          {isAdmin ? (
            <>
              <span className="nav-section-label">Administration</span>
              <NavItem to="/admin"     icon="🛡️" label="Admin Panel"  onClick={close} badge="ADMIN" />
              <NavItem to="/users"     icon="👥" label="All Users"    onClick={close} />

              <span className="nav-section-label">Account</span>
              <NavItem to="/profile"   icon="👤" label="My Profile"   onClick={close} />
            </>
          ) : isAdminOrManager ? (
            /* Manager */
            <>
              <span className="nav-section-label">Main</span>
              <NavItem to="/dashboard" icon="🏠" label="Dashboard"    onClick={close} />

              <span className="nav-section-label">Management</span>
              <NavItem to="/users"     icon="👥" label="All Users"    onClick={close} />

              <span className="nav-section-label">Account</span>
              <NavItem to="/profile"   icon="👤" label="My Profile"   onClick={close} />
            </>
          ) : (
            /* Regular user */
            <>
              <span className="nav-section-label">Main</span>
              <NavItem to="/dashboard" icon="🏠" label="Dashboard"    onClick={close} />

              <span className="nav-section-label">Account</span>
              <NavItem to="/profile"   icon="👤" label="My Profile"   onClick={close} />
            </>
          )}

        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role} · {user?.status}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span>↩</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          onClick={close}
        />
      )}

      {/* ── Main wrapper ── */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-sm hamburger-btn"
              onClick={() => setSidebarOpen(p => !p)} aria-label="Toggle sidebar">
              ☰
            </button>
          </div>
          <div className="topbar-right">
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{user?.name}</span>
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

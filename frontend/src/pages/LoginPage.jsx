import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/auth.api';
import toast from 'react-hot-toast';

const roleHome = (role) =>
  role === 'admin' || role === 'manager' ? '/admin' : '/dashboard';

/* ── Eye icon ── */
const Eye = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PwdInput = ({ name, value, onChange, placeholder, hasError, show, onToggle, admin }) => (
  <div className="input-wrap">
    <input name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
      placeholder={placeholder}
      className={`input has-icon ${hasError ? 'error' : ''} ${admin ? 'input-admin' : ''}`} />
    <button type="button" className="input-icon-btn" onClick={onToggle}><Eye open={show} /></button>
  </div>
);

/* ══════════════════════════════════════
   USER LOGIN FORM
══════════════════════════════════════ */
const UserLoginForm = ({ onDone }) => {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});

  const ch = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrs(p => ({ ...p, [e.target.name]: '' })); };

  const submit = async (e) => {
    e.preventDefault();
    const ne = {};
    if (!form.email)    ne.email    = 'Email is required.';
    if (!form.password) ne.password = 'Password is required.';
    if (Object.keys(ne).length) { setErrs(ne); return; }
    const result = await login(form.email, form.password);
    if (result.success) onDone(result.user);
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="form-group">
        <label>Email Address</label>
        <input name="email" type="email" value={form.email} onChange={ch}
          placeholder="you@example.com"
          className={`input ${errs.email ? 'error' : ''}`} autoFocus autoComplete="email" />
        {errs.email && <span className="error-text">⚠ {errs.email}</span>}
      </div>
      <div className="form-group">
        <label>Password</label>
        <PwdInput name="password" value={form.password} onChange={ch}
          placeholder="Enter your password" hasError={!!errs.password}
          show={show} onToggle={() => setShow(p => !p)} />
        {errs.password && <span className="error-text">⚠ {errs.password}</span>}
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In →'}
      </button>
    </form>
  );
};

/* ══════════════════════════════════════
   USER REGISTER FORM
══════════════════════════════════════ */
const UserRegisterForm = ({ onDone }) => {
  const { updateUserInContext } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [errs, setErrs]   = useState({});
  const [loading, setLoading] = useState(false);

  const ch = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrs(p => ({ ...p, [e.target.name]: '' })); };

  const submit = async (e) => {
    e.preventDefault();
    const ne = {};
    if (!form.name.trim())  ne.name     = 'Name is required.';
    if (!form.email)        ne.email    = 'Email is required.';
    if (!form.password)     ne.password = 'Password is required.';
    else if (form.password.length < 6) ne.password = 'Min 6 characters.';
    if (form.password !== form.confirm) ne.confirm  = 'Passwords do not match.';
    if (Object.keys(ne).length) { setErrs(ne); return; }
    setLoading(true);
    try {
      const res = await registerApi({ name: form.name, email: form.email, password: form.password });
      const { accessToken, refreshToken, user: u } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      updateUserInContext(u);
      toast.success(`Welcome, ${u.name}!`);
      onDone(u);
    } catch (err) {
      toast.error(!err.response ? 'Cannot reach server.' : err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="form-group">
        <label>Full Name</label>
        <input name="name" type="text" value={form.name} onChange={ch}
          placeholder="John Doe" className={`input ${errs.name ? 'error' : ''}`} autoFocus />
        {errs.name && <span className="error-text">⚠ {errs.name}</span>}
      </div>
      <div className="form-group">
        <label>Email Address</label>
        <input name="email" type="email" value={form.email} onChange={ch}
          placeholder="you@example.com" className={`input ${errs.email ? 'error' : ''}`} />
        {errs.email && <span className="error-text">⚠ {errs.email}</span>}
      </div>
      <div className="form-group">
        <label>Password</label>
        <PwdInput name="password" value={form.password} onChange={ch}
          placeholder="Min 6 characters" hasError={!!errs.password}
          show={showP} onToggle={() => setShowP(p => !p)} />
        {errs.password && <span className="error-text">⚠ {errs.password}</span>}
      </div>
      <div className="form-group">
        <label>Confirm Password</label>
        <PwdInput name="confirm" value={form.confirm} onChange={ch}
          placeholder="Repeat password" hasError={!!errs.confirm}
          show={showC} onToggle={() => setShowC(p => !p)} />
        {errs.confirm && <span className="error-text">⚠ {errs.confirm}</span>}
      </div>
      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Account →'}
      </button>
    </form>
  );
};

/* ══════════════════════════════════════
   ADMIN LOGIN FORM  (amber theme)
══════════════════════════════════════ */
const AdminLoginForm = ({ onDone }) => {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});

  const ch = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrs(p => ({ ...p, [e.target.name]: '' })); };

  const submit = async (e) => {
    e.preventDefault();
    const ne = {};
    if (!form.email)    ne.email    = 'Email is required.';
    if (!form.password) ne.password = 'Password is required.';
    if (Object.keys(ne).length) { setErrs(ne); return; }

    const result = await login(form.email, form.password);
    if (!result.success) return;

    if (result.user.role === 'user') {
      toast.error('Access denied. Admin or Manager credentials required.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.reload();
      return;
    }
    onDone(result.user);
  };

  return (
    <form className="admin-login-form" onSubmit={submit} noValidate>
      <div className="admin-form-group">
        <label className="admin-label">Admin Email</label>
        <input name="email" type="email" value={form.email} onChange={ch}
          placeholder="admin@example.com"
          className={`admin-input ${errs.email ? 'admin-input-error' : ''}`}
          autoFocus autoComplete="email" />
        {errs.email && <span className="admin-error-text">⚠ {errs.email}</span>}
      </div>
      <div className="admin-form-group">
        <label className="admin-label">Password</label>
        <div className="input-wrap">
          <input name="password" type={show ? 'text' : 'password'} value={form.password} onChange={ch}
            placeholder="Enter admin password"
            className={`admin-input has-icon ${errs.password ? 'admin-input-error' : ''}`} />
          <button type="button" className="admin-eye-btn" onClick={() => setShow(p => !p)}>
            <Eye open={show} />
          </button>
        </div>
        {errs.password && <span className="admin-error-text">⚠ {errs.password}</span>}
      </div>
      <button type="submit" className="admin-submit-btn" disabled={loading}>
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
            <span className="admin-spinner"></span> Authenticating...
          </span>
        ) : '🛡️ Access Admin Panel →'}
      </button>
    </form>
  );
};

/* ══════════════════════════════════════
   ADMIN REGISTER FORM
══════════════════════════════════════ */
const AdminRegisterForm = ({ onDone }) => {
  const { updateUserInContext } = useAuth();
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [errs, setErrs]   = useState({});
  const [loading, setLoading] = useState(false);

  const ch = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrs(p => ({ ...p, [e.target.name]: '' })); };

  const submit = async (e) => {
    e.preventDefault();
    const ne = {};
    if (!form.name.trim())  ne.name     = 'Name is required.';
    if (!form.email)        ne.email    = 'Email is required.';
    if (!form.password)     ne.password = 'Password is required.';
    else if (form.password.length < 6) ne.password = 'Min 6 characters.';
    if (form.password !== form.confirm) ne.confirm  = 'Passwords do not match.';
    if (Object.keys(ne).length) { setErrs(ne); return; }
    setLoading(true);
    try {
      const res = await registerApi({ name: form.name, email: form.email, password: form.password });
      const { accessToken, refreshToken, user: u } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      updateUserInContext(u);
      toast.success(`Account created for ${u.name}. Sign in with admin credentials to manage users.`);
      onDone(u);
    } catch (err) {
      toast.error(!err.response ? 'Cannot reach server.' : err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <form className="admin-login-form" onSubmit={submit} noValidate>
      <div className="admin-form-group">
        <label className="admin-label">Full Name</label>
        <input name="name" type="text" value={form.name} onChange={ch}
          placeholder="Admin Name" className={`admin-input ${errs.name ? 'admin-input-error' : ''}`} autoFocus />
        {errs.name && <span className="admin-error-text">⚠ {errs.name}</span>}
      </div>
      <div className="admin-form-group">
        <label className="admin-label">Email Address</label>
        <input name="email" type="email" value={form.email} onChange={ch}
          placeholder="admin@example.com" className={`admin-input ${errs.email ? 'admin-input-error' : ''}`} />
        {errs.email && <span className="admin-error-text">⚠ {errs.email}</span>}
      </div>
      <div className="admin-form-group">
        <label className="admin-label">Password</label>
        <div className="input-wrap">
          <input name="password" type={showP ? 'text' : 'password'} value={form.password} onChange={ch}
            placeholder="Min 6 characters" className={`admin-input has-icon ${errs.password ? 'admin-input-error' : ''}`} />
          <button type="button" className="admin-eye-btn" onClick={() => setShowP(p => !p)}><Eye open={showP} /></button>
        </div>
        {errs.password && <span className="admin-error-text">⚠ {errs.password}</span>}
      </div>
      <div className="admin-form-group">
        <label className="admin-label">Confirm Password</label>
        <div className="input-wrap">
          <input name="confirm" type={showC ? 'text' : 'password'} value={form.confirm} onChange={ch}
            placeholder="Repeat password" className={`admin-input has-icon ${errs.confirm ? 'admin-input-error' : ''}`} />
          <button type="button" className="admin-eye-btn" onClick={() => setShowC(p => !p)}><Eye open={showC} /></button>
        </div>
        {errs.confirm && <span className="admin-error-text">⚠ {errs.confirm}</span>}
      </div>
      <div className="admin-info-box">
        ℹ️ Creates a standard account. To assign admin/manager roles, use the Admin Panel after signing in.
      </div>
      <button type="submit" className="admin-submit-btn" disabled={loading}>
        {loading ? 'Creating...' : '🛡️ Create Account →'}
      </button>
    </form>
  );
};

/* ══════════════════════════════════════
   MAIN LOGIN PAGE
══════════════════════════════════════ */
const LoginPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [mode, setMode] = useState('select'); // 'select' | 'user' | 'admin'
  const [tab,  setTab]  = useState('login');

  if (user) return <Navigate to={roleHome(user.role)} replace />;

  const onDone = (u) => navigate(roleHome(u.role), { replace: true });
  const sw     = (m) => { setMode(m); setTab('login'); };

  /* ── Portal selection screen ── */
  if (mode === 'select') {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo-wrap">
              <div className="auth-logo-icon">⚡</div>
              <span className="auth-logo-name">UserMS</span>
            </div>
            <h1>Manage Users<br />with Confidence</h1>
            <p>A powerful role-based user management platform. Control access, track activity, and manage your team — all in one place.</p>
            <div className="auth-features">
              {[
                { icon: '🛡️', text: 'Role-based access control (RBAC)' },
                { icon: '🔐', text: 'JWT secured authentication' },
                { icon: '📊', text: 'Real-time user analytics' },
                { icon: '🔍', text: 'Advanced search & filtering' },
                { icon: '📝', text: 'Full audit trail tracking' },
              ].map((f, i) => (
                <div className="auth-feature" key={i}>
                  <div className="auth-feature-icon">{f.icon}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h2>Welcome back</h2>
              <p>Choose how you want to sign in</p>
            </div>
            <div className="portal-cards">
              <button className="portal-card" onClick={() => sw('user')}>
                <div className="portal-card-icon portal-icon-user">👤</div>
                <div className="portal-card-body">
                  <div className="portal-card-title">User Portal</div>
                  <div className="portal-card-desc">Sign in or create a new account</div>
                </div>
                <span className="portal-card-arrow">→</span>
              </button>
              <button className="portal-card portal-card-admin" onClick={() => sw('admin')}>
                <div className="portal-card-icon portal-icon-admin">🛡️</div>
                <div className="portal-card-body">
                  <div className="portal-card-title">Admin Portal</div>
                  <div className="portal-card-desc">Manage users, roles and permissions</div>
                </div>
                <span className="portal-card-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── User portal ── */
  if (mode === 'user') {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo-wrap">
              <div className="auth-logo-icon">⚡</div>
              <span className="auth-logo-name">UserMS</span>
            </div>
            <h1>Welcome<br />Back</h1>
            <p>Sign in to access your personal dashboard, manage your profile, and stay connected.</p>
            <div className="auth-features">
              {[
                { icon: '👤', text: 'Manage your personal profile' },
                { icon: '🔔', text: 'View notifications and activity' },
                { icon: '🔐', text: 'Secure JWT authentication' },
                { icon: '📱', text: 'Access from any device' },
              ].map((f, i) => (
                <div className="auth-feature" key={i}>
                  <div className="auth-feature-icon">{f.icon}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <button className="back-btn" onClick={() => sw('select')}>← Back</button>
              <h2>{tab === 'login' ? 'User Sign In' : 'Create Account'}</h2>
              <p>{tab === 'login' ? 'Sign in to your account' : 'Fill in the details to get started'}</p>
            </div>
            <div className="auth-tabs">
              <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
              <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Create Account</button>
            </div>
            {tab === 'login' ? <UserLoginForm onDone={onDone} /> : <UserRegisterForm onDone={onDone} />}
          </div>
        </div>
      </div>
    );
  }

  /* ── Admin portal — completely different design ── */
  return (
    <div className="admin-login-page">
      {/* Animated background */}
      <div className="admin-bg-orb admin-bg-orb-1"></div>
      <div className="admin-bg-orb admin-bg-orb-2"></div>
      <div className="admin-bg-orb admin-bg-orb-3"></div>

      {/* Back button */}
      <button className="admin-back-btn" onClick={() => sw('select')}>
        ← Back to Portal Selection
      </button>

      <div className="admin-login-container">
        {/* Left — branding */}
        <div className="admin-login-left">
          <div className="admin-shield-icon">🛡️</div>
          <h1 className="admin-login-title">Admin<br />Control Panel</h1>
          <p className="admin-login-subtitle">
            Secure access to user management, role assignments, and system administration.
          </p>

          <div className="admin-feature-list">
            {[
              { icon: '👥', label: 'User Management',    desc: 'Create, edit, deactivate users' },
              { icon: '🔑', label: 'Role Assignment',    desc: 'Assign admin, manager, user roles' },
              { icon: '📊', label: 'System Analytics',   desc: 'Live stats from your database' },
              { icon: '📋', label: 'Audit Trail',        desc: 'Track all changes with timestamps' },
            ].map((f, i) => (
              <div className="admin-feature-item" key={i}>
                <div className="admin-feature-icon-wrap">{f.icon}</div>
                <div>
                  <div className="admin-feature-label">{f.label}</div>
                  <div className="admin-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-stats-row">
            <div className="admin-stat-pill">🔒 JWT Secured</div>
            <div className="admin-stat-pill">⚡ Real-time Data</div>
            <div className="admin-stat-pill">🛡️ RBAC Enforced</div>
          </div>
        </div>

        {/* Right — form */}
        <div className="admin-login-right">
          <div className="admin-login-card">
            {/* Header */}
            <div className="admin-card-header">
              <div className="admin-card-logo">
                <span>⚡</span>
              </div>
              <div>
                <div className="admin-card-title">UserMS Admin</div>
                <div className="admin-card-sub">Secure Administration Portal</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="admin-tabs">
              <button className={`admin-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
                Sign In
              </button>
              <button className={`admin-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
                Create Account
              </button>
            </div>

            {/* Form */}
            <div className="admin-form-section">
              <div className="admin-form-title">
                {tab === 'login' ? 'Administrator Sign In' : 'Create New Account'}
              </div>
              <div className="admin-form-desc">
                {tab === 'login'
                  ? 'Enter your admin credentials to access the control panel'
                  : 'Create a new account (role can be assigned in the admin panel)'}
              </div>
              {tab === 'login'
                ? <AdminLoginForm onDone={onDone} />
                : <AdminRegisterForm onDone={onDone} />}
            </div>

            {/* Footer */}
            <div className="admin-card-footer">
              <span>🔒</span>
              <span>All sessions are encrypted and monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

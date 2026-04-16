import React, { useState, useEffect } from 'react';
import { getProfileApi, updateProfileApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EyeIcon = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const ProfilePage = () => {
  const { updateUserInContext } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await getProfileApi();
      setUser(data.data.user);
      setForm({ name: data.data.user.name, email: data.data.user.email, password: '', confirmPassword: '' });
    } catch { toast.error('Failed to load profile.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters.';
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await updateProfileApi(payload);
      setUser(data.data.user);
      updateUserInContext(data.data.user);
      setEditMode(false);
      setForm(p => ({ ...p, password: '', confirmPassword: '' }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner"></div><span className="spinner-text">Loading profile...</span></div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="page-subtitle">Manage your personal information and password</p>
        </div>
        {!editMode && (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit Profile</button>
        )}
      </div>

      <div className="detail-layout">
        {/* Profile Card */}
        <div className="user-profile-card">
          {!editMode ? (
            <>
              <div className="user-profile-top">
                <div className="user-avatar-lg">{user?.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="user-profile-name">{user?.name}</div>
                  <div className="user-profile-email">{user?.email}</div>
                  <div className="badge-row">
                    <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                    <span className={`badge badge-${user?.status}`}>{user?.status}</span>
                  </div>
                </div>
              </div>
              <div className="profile-note">
                ℹ️ Your role is managed by an administrator and cannot be changed here.
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: 600 }}>Edit Profile</h3>

              <div className="form-group">
                <label>Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  className={`input ${errors.name ? 'error' : ''}`} placeholder="Your full name" />
                {errors.name && <span className="error-text">⚠ {errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  className={`input ${errors.email ? 'error' : ''}`} placeholder="your@email.com" />
                {errors.email && <span className="error-text">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label>New Password <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
                <div className="input-wrap">
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                    className={`input has-icon ${errors.password ? 'error' : ''}`} placeholder="Leave blank to keep current" />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {errors.password && <span className="error-text">⚠ {errors.password}</span>}
              </div>

              {form.password && (
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrap">
                    <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange}
                      className={`input has-icon ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat new password" />
                    <button type="button" className="input-icon-btn" onClick={() => setShowConfirm(p => !p)}>
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="error-text">⚠ {errors.confirmPassword}</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setEditMode(false); setErrors({}); }} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Account Info */}
        <div className="card">
          <div className="card-header"><div className="card-title">Account Details</div></div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value" style={{ fontSize: '0.82rem' }}>{fmt(user?.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value" style={{ fontSize: '0.82rem' }}>{fmt(user?.updatedAt)}</span>
            </div>
            {user?.createdBy && (
              <div className="info-row">
                <span className="info-label">Created By</span>
                <span className="info-value">{user.createdBy.name}</span>
              </div>
            )}
            {user?.updatedBy && (
              <div className="info-row">
                <span className="info-label">Last Updated By</span>
                <span className="info-value">{user.updatedBy.name}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value" style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text3)' }}>{user?._id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

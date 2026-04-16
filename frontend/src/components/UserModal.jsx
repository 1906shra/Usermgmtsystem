import React, { useState, useEffect } from 'react';
import { createUserApi, updateUserApi } from '../api/users.api';
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

const UserModal = ({ user, onClose, onSuccess }) => {
  const { isAdmin } = useAuth();
  const isEditing = !!user;
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'user', status: user.status || 'active' });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    if (!isEditing && !form.password) e.password = 'Password is required.';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (isEditing) await updateUserApi(user._id, payload);
      else await createUserApi(payload);
      toast.success(isEditing ? 'User updated!' : 'User created!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" type="text" value={form.name} onChange={handleChange}
                className={`input ${errors.name ? 'error' : ''}`} placeholder="Enter full name" />
              {errors.name && <span className="error-text">⚠ {errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className={`input ${errors.email ? 'error' : ''}`} placeholder="user@example.com" />
              {errors.email && <span className="error-text">⚠ {errors.email}</span>}
            </div>

            <div className="form-group">
              <label>{isEditing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <div className="input-wrap">
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange}
                  className={`input has-icon ${errors.password ? 'error' : ''}`}
                  placeholder={isEditing ? 'Leave blank to keep current' : 'Min 6 characters'} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPass(p => !p)}>
                  <EyeIcon open={showPass} />
                </button>
              </div>
              {errors.password && <span className="error-text">⚠ {errors.password}</span>}
            </div>

            {isAdmin && (
              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleChange} className="input">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserByIdApi, deleteUserApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const { data } = await getUserByIdApi(id);
      setUser(data.data.user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load user.');
      navigate('/users');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const handleDeactivate = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserApi(id);
      toast.success('User deactivated.');
      setShowConfirm(false);
      fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setDeleteLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner"></div><span className="spinner-text">Loading user...</span></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="page">
      <div className="breadcrumb">
        <Link to="/users" className="breadcrumb-link">Users</Link>
        <span className="breadcrumb-sep">›</span>
        <span>{user.name}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>{user.name}</h1>
          <p className="page-subtitle">{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}>Edit User</button>
          {isAdmin && user.status === 'active' && (
            <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>Deactivate</button>
          )}
        </div>
      </div>

      <div className="detail-layout">
        {/* Profile Card */}
        <div className="user-profile-card">
          <div className="user-profile-top">
            <div className="user-avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-profile-name">{user.name}</div>
              <div className="user-profile-email">{user.email}</div>
              <div className="badge-row">
                <span className={`badge badge-${user.role}`}>{user.role}</span>
                <span className={`badge badge-${user.status}`}>{user.status}</span>
              </div>
            </div>
          </div>

          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text3)' }}>{user._id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Role</span>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Status</span>
              <span className={`badge badge-${user.status}`}>{user.status}</span>
            </div>
          </div>
        </div>

        {/* Audit Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Audit Information</div>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">Created At</span>
              <span className="info-value" style={{ fontSize: '0.82rem' }}>{fmt(user.createdAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Created By</span>
              <span className="info-value">
                {user.createdBy ? (
                  <span>
                    <div style={{ fontSize: '0.85rem' }}>{user.createdBy.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.createdBy.email}</div>
                  </span>
                ) : 'System'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated</span>
              <span className="info-value" style={{ fontSize: '0.82rem' }}>{fmt(user.updatedAt)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Updated By</span>
              <span className="info-value">
                {user.updatedBy ? (
                  <span>
                    <div style={{ fontSize: '0.85rem' }}>{user.updatedBy.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.updatedBy.email}</div>
                  </span>
                ) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showEdit && (
        <UserModal user={user} onClose={() => setShowEdit(false)} onSuccess={() => { setShowEdit(false); fetchUser(); }} />
      )}
      {showConfirm && (
        <ConfirmDialog
          title="Deactivate User"
          message={`Deactivate "${user.name}"? They won't be able to log in.`}
          onConfirm={handleDeactivate}
          onCancel={() => setShowConfirm(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default UserDetailPage;

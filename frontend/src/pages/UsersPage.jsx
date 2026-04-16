import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getUsersApi, deleteUserApi } from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import UserModal from '../components/UserModal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsersApi({ page, limit, ...filters });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleFilterChange = (e) => {
    setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserApi(confirmDelete._id);
      toast.success(`${confirmDelete.name} deactivated.`);
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally { setDeleteLoading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p className="page-subtitle">{pagination.total} total users in the system</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            + Create User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input
          type="text" name="search" value={filters.search}
          onChange={handleFilterChange}
          placeholder="🔍  Search by name or email..."
          className="input filter-search"
        />
        <select name="role" value={filters.role} onChange={handleFilterChange} className="input filter-select">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="input filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text3)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No users found matching your filters.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">{u.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div className="user-cell-name">{u.name}</div>
                          <div className="user-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="action-btns">
                        <Link to={`/users/${u._id}`} className="btn btn-ghost btn-sm">View</Link>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditingUser(u); setShowModal(true); }}>Edit</button>
                        {isAdmin && u.status === 'active' && (
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(u)}>Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer */}
        {!loading && users.length > 0 && (
          <div className="table-footer">
            <span className="table-count">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
            </span>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                {pages.map(p => (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>›</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => { setShowModal(false); setEditingUser(null); }}
          onSuccess={() => { setShowModal(false); setEditingUser(null); fetchUsers(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Deactivate User"
          message={`Deactivate "${confirmDelete.name}"? They won't be able to log in.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default UsersPage;

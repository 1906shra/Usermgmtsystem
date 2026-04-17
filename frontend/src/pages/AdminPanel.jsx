import React, { useState, useEffect, useCallback } from "react";
import { getUsersApi, deleteUserApi, updateUserApi } from "../api/users.api";
import { adminRegisterApi } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const fmtFull = (d) =>
  d ? new Date(d).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/* Avatar color palette */
const AVATAR_COLORS = ["#7c6af7","#00d4aa","#f59e0b","#ef4444","#06b6d4","#10b981","#8b5cf6","#ec4899"];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || "#7c6af7";

/* Export users array to CSV file */
const exportCSV = (users) => {
  const headers = ["Name","Email","Role","Status","Plan","Joined","Last Active"];
  const rows = users.map(u => [
    `"${u.name}"`, `"${u.email}"`, u.role, u.status, "Free",
    fmt(u.createdAt), fmt(u.updatedAt),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "users.csv"; a.click();
  URL.revokeObjectURL(url);
};

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

/* ── Create / Edit Modal ── */
const UserFormModal = ({ user, onClose, onSuccess }) => {
  const { isAdmin } = useAuth();
  const isEdit = !!user;
  const [sp, setSp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", role: "user", status: "active" });

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email, password: "", confirm: "", role: user.role, status: user.status });
  }, [user]);

  const ch = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrs(p => ({ ...p, [e.target.name]: "" })); };

  const submit = async (e) => {
    e.preventDefault();
    const ne = {};
    if (!form.name.trim()) ne.name = "Name required.";
    if (!form.email.trim()) ne.email = "Email required.";
    if (!isEdit && !form.password) ne.password = "Password required.";
    if (form.password && form.password.length < 6) ne.password = "Min 6 chars.";
    if (!isEdit && form.password !== form.confirm) ne.confirm = "Passwords do not match.";
    if (Object.keys(ne).length) { setErrs(ne); return; }
    setLoading(true);
    try {
      if (isEdit) {
        const p = { name: form.name, email: form.email, role: form.role, status: form.status };
        if (form.password) p.password = form.password;
        await updateUserApi(user._id, p);
        toast.success("User updated!");
      } else {
        await adminRegisterApi({ name: form.name, email: form.email, password: form.password, role: form.role, status: form.status });
        toast.success(`Account created for ${form.name}!`);
      }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.1rem" }}>{isEdit ? "✏️ Edit User" : "➕ Create New Account"}</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: "0.2rem" }}>
              {isEdit ? "Update user details" : "Fill in details to create a new account"}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input name="name" type="text" value={form.name} onChange={ch} className={`input ${errs.name ? "error" : ""}`} placeholder="e.g. John Smith" autoFocus />
              {errs.name && <span className="error-text">⚠ {errs.name}</span>}
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={ch} className={`input ${errs.email ? "error" : ""}`} placeholder="john@example.com" />
              {errs.email && <span className="error-text">⚠ {errs.email}</span>}
            </div>
            <div className="form-group">
              <label>{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
              <div className="input-wrap">
                <input name="password" type={sp ? "text" : "password"} value={form.password} onChange={ch} className={`input has-icon ${errs.password ? "error" : ""}`} placeholder={isEdit ? "Leave blank to keep" : "Min 6 characters"} />
                <button type="button" className="input-icon-btn" onClick={() => setSp(p => !p)}><EyeIcon open={sp} /></button>
              </div>
              {errs.password && <span className="error-text">⚠ {errs.password}</span>}
            </div>
            {!isEdit && (
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-wrap">
                  <input name="confirm" type={sp ? "text" : "password"} value={form.confirm} onChange={ch} className={`input has-icon ${errs.confirm ? "error" : ""}`} placeholder="Repeat password" />
                  <button type="button" className="input-icon-btn" onClick={() => setSp(p => !p)}><EyeIcon open={sp} /></button>
                </div>
                {errs.confirm && <span className="error-text">⚠ {errs.confirm}</span>}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={form.role} onChange={ch} className="input">
                  <option value="user">👤 User</option>
                  <option value="manager">👔 Manager</option>
                  {isAdmin && <option value="admin">🛡️ Admin</option>}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={ch} className="input">
                  <option value="active">✅ Active</option>
                  <option value="inactive">🚫 Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : isEdit ? "Save Changes" : "Create Account"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── User Profile Drawer ── */
const UserDrawer = ({ user, onClose, onEdit, onToggle }) => {
  if (!user) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header"><span className="drawer-title">👤 User Profile</span><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="drawer-profile">
          <div className="drawer-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="drawer-name">{user.name}</div>
            <div className="drawer-email">{user.email}</div>
            <div className="badge-row" style={{ marginTop: "0.5rem" }}>
              <span className={`badge badge-${user.role}`}>{user.role}</span>
              <span className={`badge badge-${user.status}`}>{user.status}</span>
            </div>
          </div>
        </div>
        <div className="drawer-section">
          <div className="drawer-section-title">Account Details</div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">User ID</span><span className="info-value" style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--text3)" }}>{user._id}</span></div>
            <div className="info-row"><span className="info-label">Role</span><span className={`badge badge-${user.role}`}>{user.role}</span></div>
            <div className="info-row"><span className="info-label">Status</span><span className={`badge badge-${user.status}`}>{user.status}</span></div>
            <div className="info-row"><span className="info-label">Email</span><span className="info-value" style={{ fontSize: "0.82rem" }}>{user.email}</span></div>
          </div>
        </div>
        <div className="drawer-section">
          <div className="drawer-section-title">Audit Trail</div>
          <div className="info-rows">
            <div className="info-row"><span className="info-label">Created</span><span className="info-value" style={{ fontSize: "0.8rem" }}>{fmtFull(user.createdAt)}</span></div>
            <div className="info-row"><span className="info-label">Created By</span><span className="info-value">{user.createdBy ? user.createdBy.name : "System"}</span></div>
            <div className="info-row"><span className="info-label">Last Updated</span><span className="info-value" style={{ fontSize: "0.8rem" }}>{fmtFull(user.updatedAt)}</span></div>
            <div className="info-row"><span className="info-label">Updated By</span><span className="info-value">{user.updatedBy ? user.updatedBy.name : "—"}</span></div>
          </div>
        </div>
        <div className="drawer-actions">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onEdit(user)}>✏️ Edit User</button>
          <button className={user.status === "active" ? "btn btn-danger" : "btn btn-accent"} style={{ flex: 1 }} onClick={() => onToggle(user)}>
            {user.status === "active" ? "🚫 Deactivate" : "✅ Reactivate"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════
   ADMIN PANEL
════════════════════════════ */
const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0, admins: 0, managers: 0, regularUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const limit = 8;
  const [sel, setSel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actLoading, setActLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsersApi({ page, limit, ...filters });
      setUsers(data.data.users);
      setPagination(data.data.pagination);
    } catch { toast.error("Failed to load users."); }
    finally { setLoading(false); }
  }, [page, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const [all, active, admins, managers, regular] = await Promise.all([
        getUsersApi({ limit: 1 }),
        getUsersApi({ limit: 1, status: "active" }),
        getUsersApi({ limit: 1, role: "admin" }),
        getUsersApi({ limit: 1, role: "manager" }),
        getUsersApi({ limit: 1, role: "user" }),
      ]);
      const total = all.data.data.pagination.total;
      const act = active.data.data.pagination.total;
      setStats({
        total, active: act, inactive: total - act,
        admins: admins.data.data.pagination.total,
        managers: managers.data.data.pagination.total,
        regularUsers: regular.data.data.pagination.total,
      });
    } catch {}
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const refresh = () => { fetchUsers(); fetchStats(); setSelectedIds([]); };
  const fch = (e) => { setFilters(p => ({ ...p, [e.target.name]: e.target.value })); setPage(1); };
  const openCreate = () => { setEditUser(null); setSel(null); setShowModal(true); };
  const openEdit = (u) => { setEditUser(u); setSel(null); setShowModal(true); };
  const openToggle = (u) => { setConfirm({ user: u, type: u.status === "active" ? "deactivate" : "reactivate" }); setSel(null); };

  /* CSV export */
  const handleExportCSV = async () => {
    try {
      const { data } = await getUsersApi({ limit: 9999 });
      exportCSV(data.data.users);
      toast.success("CSV exported!");
    } catch { toast.error("Export failed."); }
  };

  /* Bulk ban */
  const handleBulkBan = async () => {
    if (!selectedIds.length) { toast.error("No users selected."); return; }
    setActLoading(true);
    try {
      await Promise.all(selectedIds.map(id => deleteUserApi(id)));
      toast.success(`${selectedIds.length} user(s) banned.`);
      refresh();
    } catch { toast.error("Bulk action failed."); }
    finally { setActLoading(false); }
  };

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === users.length ? [] : users.map(u => u._id));

  const doConfirm = async () => {
    if (!confirm) return;
    setActLoading(true);
    try {
      if (confirm.type === "deactivate") {
        await deleteUserApi(confirm.user._id);
        toast.success(`${confirm.user.name} banned.`);
      } else {
        await updateUserApi(confirm.user._id, { status: "active" });
        toast.success(`${confirm.user.name} reactivated.`);
      }
      setConfirm(null); refresh();
    } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setActLoading(false); }
  };

  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);

  const STATS = [
    {
      icon: "👥", iconBg: "rgba(124,106,247,0.18)", orbColor: "rgba(124,106,247,0.25)",
      value: stats.total.toLocaleString(), label: "Total Users",
      sub: "↑ 128 this month", subColor: "#22c55e",
    },
    {
      icon: "✅", iconBg: "rgba(34,197,94,0.15)", orbColor: "rgba(34,197,94,0.2)",
      value: stats.active.toLocaleString(), label: "Active Accounts",
      sub: "↑ 99.2% uptime", subColor: "#22c55e",
    },
    {
      icon: "⏳", iconBg: "rgba(245,158,11,0.15)", orbColor: "rgba(245,158,11,0.2)",
      value: stats.inactive.toLocaleString(), label: "Pending Verification",
      sub: "↑ 32 new pending", subColor: "#22c55e",
    },
    {
      icon: "⛔", iconBg: "rgba(239,68,68,0.15)", orbColor: "rgba(239,68,68,0.2)",
      value: "32", label: "Banned / Suspended",
      sub: "↑ 5 this week", subColor: "#22c55e",
    },
  ];

  const statusBadge = (status) => {
    if (status === "active") return <span className="badge badge-active">● Active</span>;
    if (status === "inactive") return <span className="badge badge-inactive">⛔ Banned</span>;
    return <span className="badge badge-pending">⏳ Pending</span>;
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="ad-topbar">
        <div>
          <h1 className="ad-title">Admin Overview</h1>
          <p className="ad-sub">Full system control · Last sync: 2 min ago</p>
        </div>
        <div className="ad-topbar-actions">
          <input
            type="text" name="search" value={filters.search} onChange={fch}
            placeholder="🔍 Search users…" className="input ad-search"
          />
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>Export CSV</button>
          {isAdmin && (
            <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add User</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="ad-stats">
        {STATS.map(s => (
          <div key={s.label} className="ad-stat-card">
            <div className="ad-stat-orb" style={{ background: s.orbColor }} />
            <div className="ad-stat-icon-wrap" style={{ background: s.iconBg }}>{s.icon}</div>
            <div className="ad-stat-value">{s.value}</div>
            <div className="ad-stat-label">{s.label}</div>
            <div className="ad-stat-sub" style={{ color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="ad-table-card">
        <div className="ad-table-header">
          <span className="ad-table-title">User Management</span>
          <div className="ad-table-filters">
            <button className={`ad-filter-btn ${!filters.status && !filters.role ? "active" : ""}`}
              onClick={() => { setFilters(p => ({ ...p, status: "", role: "" })); setPage(1); }}>All</button>
            <button className={`ad-filter-btn ${filters.status === "active" ? "active" : ""}`}
              onClick={() => { setFilters(p => ({ ...p, status: "active", role: "" })); setPage(1); }}>Active</button>
            <button className={`ad-filter-btn ${filters.status === "inactive" ? "active" : ""}`}
              onClick={() => { setFilters(p => ({ ...p, status: "inactive", role: "" })); setPage(1); }}>Pending</button>
            <button className="ad-filter-btn"
              onClick={() => { setFilters(p => ({ ...p, status: "inactive", role: "" })); setPage(1); }}>Banned</button>
            {isAdmin && selectedIds.length > 0 && (
              <button className="ad-filter-btn-actions" onClick={handleBulkBan} disabled={actLoading}>
                ⚙ Bulk Actions ({selectedIds.length})
              </button>
            )}
            <select name="role" value={filters.role} onChange={fch} className="input ad-role-filter">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)" }}>
              <div className="spinner" style={{ margin: "0 auto 1rem" }} />Loading…
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No users found.</p>
              {isAdmin && <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={openCreate}>+ Add First User</button>}
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="table-checkbox"
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={toggleAll} />
                  </th>
                  <th>USER</th>
                  <th>STATUS</th>
                  <th>PLAN</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                  <th>LAST ACTIVE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <input type="checkbox" className="table-checkbox"
                        checked={selectedIds.includes(u._id)}
                        onChange={() => toggleSelect(u._id)}
                        onClick={e => e.stopPropagation()} />
                    </td>
                    <td style={{ cursor: "pointer" }} onClick={() => setSel(u)}>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: avatarColor(u.name) }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-cell-name">{u.name}</div>
                          <div className="user-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{statusBadge(u.status)}</td>
                    <td><span className="badge badge-free">Free</span></td>
                    <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{fmt(u.createdAt)}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text2)" }}>{fmt(u.updatedAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="action-btns">
                        <button className="btn btn-sm"
                          style={{ background: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.25)", fontSize: "0.74rem" }}
                          onClick={() => setSel(u)}>View</button>
                        {isAdmin && (
                          <button className="btn btn-sm"
                            style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)", fontSize: "0.74rem" }}
                            onClick={() => openEdit(u)}>Edit</button>
                        )}
                        {isAdmin && (u.status === "active"
                          ? <button className="btn btn-danger btn-sm" style={{ fontSize: "0.74rem" }} onClick={() => openToggle(u)}>Ban</button>
                          : <button className="btn btn-accent btn-sm" style={{ fontSize: "0.74rem" }} onClick={() => openToggle(u)}>Unban</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && users.length > 0 && (
          <div className="table-footer">
            <span className="table-count">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total} users
            </span>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                {pages.map(p => <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>)}
                <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom grid */}
      <div className="ad-bottom-grid">
        <div className="ad-card">
          <div className="ad-card-header"><span className="ad-card-title">Audit Log</span></div>
          <div className="ad-audit-list">
            {users.slice(0, 5).map((u, i) => (
              <div className="ad-audit-item" key={i}>
                <div className="ad-audit-dot" style={{ background: u.status === "active" ? "var(--success)" : "var(--danger)" }} />
                <div className="ad-audit-text"><strong>{u.name}</strong> — {u.role} · {u.status}</div>
                <div className="ad-audit-time">{fmt(u.updatedAt)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header"><span className="ad-card-title">System Metrics</span></div>
          <div className="info-rows">
            {[
              { label: "Total Users",   value: stats.total },
              { label: "Active",        value: stats.active },
              { label: "Inactive",      value: stats.inactive },
              { label: "Admins",        value: stats.admins },
              { label: "Managers",      value: stats.managers },
              { label: "Regular Users", value: stats.regularUsers },
            ].map((m, i) => (
              <div className="info-row" key={i}>
                <span className="info-label">{m.label}</span>
                <span className="info-value" style={{ fontWeight: 600 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ad-card">
          <div className="ad-card-header"><span className="ad-card-title">Roles Breakdown</span></div>
          <div className="ad-roles-list">
            {[
              { label: "Users",    value: stats.regularUsers, color: "var(--success)" },
              { label: "Managers", value: stats.managers,     color: "var(--warning)" },
              { label: "Admins",   value: stats.admins,       color: "var(--primary)" },
              { label: "Inactive", value: stats.inactive,     color: "var(--danger)"  },
            ].map((r, i) => (
              <div className="ad-role-item" key={i}>
                <div className="ad-role-left">
                  <div className="ad-role-dot" style={{ background: r.color }} />
                  <span className="ad-role-label">{r.label}</span>
                </div>
                <span className="ad-role-value">{r.value}</span>
                <div className="ad-role-bar">
                  <div className="ad-role-fill" style={{ width: stats.total ? `${(r.value / stats.total) * 100}%` : "0%", background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <UserDrawer user={sel} onClose={() => setSel(null)} onEdit={openEdit} onToggle={openToggle} />

      {showModal && (
        <UserFormModal user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSuccess={() => { setShowModal(false); setEditUser(null); refresh(); }} />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.type === "deactivate" ? "Ban User" : "Reactivate User"}
          message={confirm.type === "deactivate"
            ? `Ban "${confirm.user.name}"? They won't be able to log in.`
            : `Reactivate "${confirm.user.name}"? They will be able to log in again.`}
          onConfirm={doConfirm} onCancel={() => setConfirm(null)} loading={actLoading} />
      )}
    </div>
  );
};

export default AdminPanel;

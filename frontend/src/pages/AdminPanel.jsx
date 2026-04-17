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

  /* ── Admin-specific styles (completely different from user dashboard) ── */
  const A = {
    page: { background: 'transparent', minHeight: '100vh' },
    header: {
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem',
      padding: '1.5rem 1.75rem',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(239,68,68,0.06))',
      border: '1px solid rgba(124,58,237,0.2)',
      borderRadius: '16px',
    },
    titleWrap: {},
    title: { fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #c4b5fd, #f87171)', WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
    sub: { fontSize: '0.83rem', color: 'rgba(196,181,253,0.6)', marginTop: '0.25rem' },
    actions: { display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' },
    searchInput: {
      padding: '0.6rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(124,58,237,0.25)',
      borderRadius: '8px', color: '#e8edf5', fontSize: '0.85rem', outline: 'none', width: '210px',
      fontFamily: 'inherit',
    },
    btnCsv: {
      padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: '8px', color: '#e8edf5', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
    },
    btnAdd: {
      padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg, #7c3aed, #db2777)',
      border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 700,
      cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
    },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' },
    statCard: (orbColor) => ({
      background: 'linear-gradient(135deg, #1a1035, #16122a)',
      border: '1px solid rgba(124,58,237,0.18)',
      borderRadius: '14px', padding: '1.35rem', position: 'relative', overflow: 'hidden',
      transition: 'transform .2s, box-shadow .2s',
    }),
    tableCard: {
      background: 'linear-gradient(180deg, #130d24, #0f0a1e)',
      border: '1px solid rgba(124,58,237,0.18)',
      borderRadius: '14px', overflow: 'hidden', marginBottom: '1.5rem',
    },
    tableHeader: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.25rem', borderBottom: '1px solid rgba(124,58,237,0.12)',
      flexWrap: 'wrap', gap: '0.65rem',
      background: 'rgba(124,58,237,0.06)',
    },
    filterBtn: (active) => ({
      padding: '0.3rem 0.75rem', borderRadius: '8px', fontSize: '0.79rem', cursor: 'pointer',
      fontFamily: 'inherit', border: active ? 'none' : '1px solid rgba(196,181,253,0.18)',
      background: active ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'transparent',
      color: active ? '#fff' : 'rgba(196,181,253,0.6)',
      boxShadow: active ? '0 2px 10px rgba(124,58,237,0.35)' : 'none',
    }),
    bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px,1fr))', gap: '1.25rem' },
    bottomCard: {
      background: 'linear-gradient(135deg, #1a1035, #16122a)',
      border: '1px solid rgba(124,58,237,0.15)',
      borderRadius: '14px', padding: '1.35rem',
    },
  };

  return (
    <div style={{ animation: 'fadeUp .25s ease' }}>
      {/* ── Header ── */}
      <div style={A.header}>
        <div style={A.titleWrap}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', boxShadow: '0 0 16px rgba(124,58,237,0.45)' }}>🛡️</div>
            <h1 style={A.title}>Admin Overview</h1>
          </div>
          <p style={A.sub}>Full system control · {pagination.total} registered users · Last sync: just now</p>
        </div>
        <div style={A.actions}>
          <input type="text" name="search" value={filters.search} onChange={fch}
            placeholder="🔍 Search users…" style={A.searchInput}
            onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'} />
          <button style={A.btnCsv} onClick={handleExportCSV}
            onMouseEnter={e => e.target.style.background='rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.target.style.background='rgba(255,255,255,0.06)'}>
            📤 Export CSV
          </button>
          {isAdmin && (
            <button style={A.btnAdd} onClick={openCreate}
              onMouseEnter={e => e.target.style.transform='translateY(-1px)'}
              onMouseLeave={e => e.target.style.transform='none'}>
              ＋ Add User
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ ...A.statsGrid, gridTemplateColumns: 'repeat(4,1fr)' }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={A.statCard(s.orbColor)}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(124,58,237,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
            <div style={{ position:'absolute',width:80,height:80,borderRadius:'50%',top:-18,right:-18,background:s.orbColor,filter:'blur(2px)',opacity:.5 }} />
            <div style={{ width:34,height:34,borderRadius:9,background:s.iconBg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',marginBottom:'.65rem',position:'relative',zIndex:1 }}>{s.icon}</div>
            <div style={{ fontSize:'1.85rem',fontWeight:900,lineHeight:1,letterSpacing:'-.02em',position:'relative',zIndex:1 }}>{s.value}</div>
            <div style={{ fontSize:'.78rem',color:'rgba(196,181,253,0.6)',marginTop:'.25rem',fontWeight:500 }}>{s.label}</div>
            <div style={{ fontSize:'.72rem',marginTop:'.18rem',fontWeight:500,color:s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={A.tableCard}>
        <div style={A.tableHeader}>
          <span style={{ fontSize:'.95rem',fontWeight:700,color:'#e8edf5' }}>User Management</span>
          <div style={{ display:'flex',alignItems:'center',gap:'.4rem',flexWrap:'wrap' }}>
            <button style={A.filterBtn(!filters.status && !filters.role)}
              onClick={() => { setFilters(p => ({ ...p, status: "", role: "" })); setPage(1); }}>All</button>
            <button style={A.filterBtn(filters.status === "active")}
              onClick={() => { setFilters(p => ({ ...p, status: "active", role: "" })); setPage(1); }}>Active</button>
            <button style={A.filterBtn(filters.status === "inactive" && filters.role === "")}
              onClick={() => { setFilters(p => ({ ...p, status: "inactive", role: "" })); setPage(1); }}>Pending</button>
            <button style={A.filterBtn(false)}
              onClick={() => { setFilters(p => ({ ...p, status: "inactive", role: "" })); setPage(1); }}>Banned</button>
            {isAdmin && selectedIds.length > 0 && (
              <button style={{ ...A.filterBtn(false), border:'1px solid rgba(239,68,68,0.35)', color:'#f87171' }}
                onClick={handleBulkBan} disabled={actLoading}>
                ⚙ Bulk Actions ({selectedIds.length})
              </button>
            )}
            <select name="role" value={filters.role} onChange={fch} style={{
              padding:'.32rem .7rem',background:'rgba(0,0,0,0.3)',border:'1px solid rgba(124,58,237,0.2)',
              borderRadius:'8px',color:'#e8edf5',fontSize:'.79rem',outline:'none',fontFamily:'inherit',width:120,
            }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Table content */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(196,181,253,0.4)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', borderTopColor: '#a78bfa' }} />
              Loading users…
            </div>
          ) : users.length === 0 ? (
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',padding:'4rem 2rem',color:'rgba(196,181,253,0.4)' }}>
              <div style={{ fontSize:'2.5rem',marginBottom:'.75rem',opacity:.5 }}>👥</div>
              <p>No users found.</p>
              {isAdmin && <button style={{ marginTop:'1rem', ...A.btnAdd }} onClick={openCreate}>+ Add First User</button>}
            </div>
          ) : (
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'.875rem' }}>
              <thead>
                <tr style={{ background:'rgba(124,58,237,0.08)' }}>
                  <th style={{ padding:'.75rem 1rem',width:40,textAlign:'left' }}>
                    <input type="checkbox" style={{ accentColor:'#a78bfa',cursor:'pointer' }}
                      checked={selectedIds.length === users.length && users.length > 0}
                      onChange={toggleAll} />
                  </th>
                  {['USER','STATUS','PLAN','ROLE','JOINED','LAST ACTIVE','ACTIONS'].map(h => (
                    <th key={h} style={{ padding:'.75rem 1rem',textAlign:'left',fontSize:'.68rem',fontWeight:700,color:'rgba(167,139,250,0.6)',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap',borderBottom:'1px solid rgba(124,58,237,0.12)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom:'1px solid rgba(124,58,237,0.08)', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(124,58,237,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'.8rem 1rem' }}>
                      <input type="checkbox" style={{ accentColor:'#a78bfa',cursor:'pointer' }}
                        checked={selectedIds.includes(u._id)}
                        onChange={() => toggleSelect(u._id)} onClick={e => e.stopPropagation()} />
                    </td>
                    <td style={{ padding:'.8rem 1rem',cursor:'pointer' }} onClick={() => setSel(u)}>
                      <div style={{ display:'flex',alignItems:'center',gap:'.65rem' }}>
                        <div style={{ width:32,height:32,borderRadius:'50%',background:avatarColor(u.name),display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.78rem',fontWeight:700,color:'#fff',flexShrink:0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:500,fontSize:'.875rem' }}>{u.name}</div>
                          <div style={{ fontSize:'.73rem',color:'rgba(139,146,164,0.7)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'.8rem 1rem' }}>{statusBadge(u.status)}</td>
                    <td style={{ padding:'.8rem 1rem' }}>
                      <span style={{ padding:'.18rem .6rem',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'999px',fontSize:'.7rem',fontWeight:600,color:'rgba(139,146,164,0.8)' }}>Free</span>
                    </td>
                    <td style={{ padding:'.8rem 1rem' }}>
                      <span className={`badge badge-${u.role}`}>{u.role}</span>
                    </td>
                    <td style={{ padding:'.8rem 1rem',fontSize:'.79rem',color:'rgba(139,146,164,0.7)' }}>{fmt(u.createdAt)}</td>
                    <td style={{ padding:'.8rem 1rem',fontSize:'.79rem',color:'rgba(139,146,164,0.7)' }}>{fmt(u.updatedAt)}</td>
                    <td style={{ padding:'.8rem 1rem' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex',gap:'.3rem' }}>
                        <button onClick={() => setSel(u)} style={{ padding:'.28rem .65rem',background:'rgba(6,182,212,0.1)',border:'1px solid rgba(6,182,212,0.25)',borderRadius:6,color:'#22d3ee',fontSize:'.73rem',cursor:'pointer',fontFamily:'inherit' }}>View</button>
                        {isAdmin && <button onClick={() => openEdit(u)} style={{ padding:'.28rem .65rem',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.25)',borderRadius:6,color:'#a78bfa',fontSize:'.73rem',cursor:'pointer',fontFamily:'inherit' }}>Edit</button>}
                        {isAdmin && (u.status === "active"
                          ? <button onClick={() => openToggle(u)} style={{ padding:'.28rem .65rem',background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:6,color:'#f87171',fontSize:'.73rem',cursor:'pointer',fontFamily:'inherit' }}>Ban</button>
                          : <button onClick={() => openToggle(u)} style={{ padding:'.28rem .65rem',background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:6,color:'#4ade80',fontSize:'.73rem',cursor:'pointer',fontFamily:'inherit' }}>Unban</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        {!loading && users.length > 0 && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'.85rem 1.25rem',borderTop:'1px solid rgba(124,58,237,0.12)',background:'rgba(124,58,237,0.04)' }}>
            <span style={{ fontSize:'.8rem',color:'rgba(167,139,250,0.5)' }}>
              Showing {(page-1)*limit+1}–{Math.min(page*limit,pagination.total)} of {pagination.total} users
            </span>
            {pagination.totalPages > 1 && (
              <div style={{ display:'flex',gap:'.35rem' }}>
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ padding:'.3rem .65rem',background:'transparent',border:'1px solid rgba(167,139,250,0.2)',borderRadius:7,color:'rgba(167,139,250,0.7)',fontSize:'.79rem',cursor:'pointer',fontFamily:'inherit',opacity:page===1?.4:1 }}>← Prev</button>
                {pages.map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width:30,height:30,borderRadius:7,border:'none',background:p===page?'linear-gradient(135deg,#7c3aed,#6d28d9)':'rgba(124,58,237,0.1)',color:p===page?'#fff':'rgba(167,139,250,0.7)',fontSize:'.79rem',cursor:'pointer',fontFamily:'inherit' }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(pagination.totalPages,p+1))} disabled={page===pagination.totalPages}
                  style={{ padding:'.3rem .65rem',background:'transparent',border:'1px solid rgba(167,139,250,0.2)',borderRadius:7,color:'rgba(167,139,250,0.7)',fontSize:'.79rem',cursor:'pointer',fontFamily:'inherit',opacity:page===pagination.totalPages?.4:1 }}>Next →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom grid ── */}
      <div style={A.bottomGrid}>
        {/* Audit Log */}
        <div style={A.bottomCard}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <span style={{ fontSize:'.9rem',fontWeight:700,color:'#e8edf5' }}>📋 Audit Log</span>
          </div>
          {users.slice(0,5).map((u,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:'.65rem',padding:'.55rem 0',borderBottom:'1px solid rgba(124,58,237,0.08)' }}
              className={i === users.slice(0,5).length-1 ? '' : ''}>
              <div style={{ width:7,height:7,borderRadius:'50%',background:u.status==='active'?'#22c55e':'#ef4444',flexShrink:0 }} />
              <div style={{ flex:1,fontSize:'.79rem' }}><strong>{u.name}</strong> — {u.role} · {u.status}</div>
              <div style={{ fontSize:'.7rem',color:'rgba(139,146,164,0.6)',whiteSpace:'nowrap' }}>{fmt(u.updatedAt)}</div>
            </div>
          ))}
        </div>

        {/* System Metrics */}
        <div style={A.bottomCard}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <span style={{ fontSize:'.9rem',fontWeight:700,color:'#e8edf5' }}>📊 System Metrics</span>
          </div>
          {[
            { label:'Total Users',  value:stats.total,        color:'#a78bfa' },
            { label:'Active',       value:stats.active,       color:'#4ade80' },
            { label:'Inactive',     value:stats.inactive,     color:'#f87171' },
            { label:'Admins',       value:stats.admins,       color:'#c4b5fd' },
            { label:'Managers',     value:stats.managers,     color:'#fbbf24' },
            { label:'Regular Users',value:stats.regularUsers, color:'#67e8f9' },
          ].map((m,i) => (
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.6rem 0',borderBottom:'1px solid rgba(124,58,237,0.08)' }}>
              <span style={{ fontSize:'.79rem',color:'rgba(196,181,253,0.6)' }}>{m.label}</span>
              <span style={{ fontSize:'.9rem',fontWeight:700,color:m.color }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Roles Breakdown */}
        <div style={A.bottomCard}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem' }}>
            <span style={{ fontSize:'.9rem',fontWeight:700,color:'#e8edf5' }}>🎭 Roles Breakdown</span>
          </div>
          {[
            { label:'Users',    value:stats.regularUsers, color:'#4ade80' },
            { label:'Managers', value:stats.managers,     color:'#fbbf24' },
            { label:'Admins',   value:stats.admins,       color:'#a78bfa' },
            { label:'Inactive', value:stats.inactive,     color:'#f87171' },
          ].map((r,i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:'.65rem',marginBottom:'.8rem' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'.45rem',width:85,flexShrink:0 }}>
                <div style={{ width:7,height:7,borderRadius:'50%',background:r.color,flexShrink:0 }} />
                <span style={{ fontSize:'.79rem',color:'rgba(196,181,253,0.6)' }}>{r.label}</span>
              </div>
              <span style={{ fontSize:'.83rem',fontWeight:700,color:r.color,width:38,textAlign:'right',flexShrink:0 }}>{r.value}</span>
              <div style={{ flex:1,height:5,background:'rgba(124,58,237,0.15)',borderRadius:'999px',overflow:'hidden' }}>
                <div style={{ height:'100%',borderRadius:'999px',background:r.color,width:stats.total?`${(r.value/stats.total)*100}%`:'0%',transition:'width .5s ease' }} />
              </div>
            </div>
          ))}
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


import React from 'react';

const ConfirmDialog = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button className="modal-close" onClick={onCancel}>✕</button>
      </div>
      <div className="modal-body">
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;

import { useState, useEffect, Fragment } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'user', department: '', status: 'Active' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  function openModal(index = null) {
    if (index !== null) {
      const u = users[index];
      const parts = (u.full_name || '').split(' ');
      setForm({
        firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '',
        email: u.email, phone: u.phone || '', role: u.role,
        department: u.department || '', status: u.status,
      });
      setEditIndex(index);
    } else {
      setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'user', department: '', status: 'Active' });
      setEditIndex(null);
    }
    setStep(1);
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fullName = `${form.firstName} ${form.lastName}`.trim();
    if (editIndex !== null) {
      const userId = users[editIndex].id;
      const { error } = await supabase.from('profiles').update({
        full_name: fullName, email: form.email, phone: form.phone,
        role: form.role, department: form.department, status: form.status,
      }).eq('id', userId);
      if (error) { alert('Error updating user: ' + error.message); return; }
      alert(`User "${fullName}" updated!`);
    } else {
      // For new users, we just create a profile (admin can't create auth users via client)
      alert('To add new users, they need to sign up at the registration page. You can edit their role and department here after they register.');
      setShowModal(false);
      return;
    }
    setShowModal(false);
    fetchUsers();
  }

  async function handleDelete(index) {
    const u = users[index];
    if (confirm(`Delete user ${u.full_name}?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', u.id);
      if (error) { alert('Error deleting: ' + error.message); return; }
      setUsers(users.filter((_, i) => i !== index));
    }
  }

  const roleBadge = (role) => role === 'admin' ? 'badge badge-admin' : 'badge badge-staff';
  const statusBadge = (status) => status === 'Active' ? 'badge badge-active' : 'badge badge-pending';
  const iconClass = (u) => u.role === 'admin' ? 'user-icon' : u.status === 'Pending' ? 'user-icon pending' : 'user-icon staff';

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Users &amp; Roles</h1>
          <p>Manage user accounts and permissions</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading users...</p></div>
        ) : (
          <div className="user-mgmt-card">
            <div className="user-mgmt-header">
              <h2>User Management</h2>
              <button className="btn-add-user" onClick={() => openModal()}>Add New User</button>
            </div>
            <table className="inventory-table user-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <svg className={iconClass(u)} viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                        <span className="user-name-text">{u.full_name || 'No Name'}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={roleBadge(u.role)}>{u.role === 'admin' ? 'Admin' : 'Staff'}</span></td>
                    <td>{u.department || '—'}</td>
                    <td><span className={statusBadge(u.status)}>{u.status}</span></td>
                    <td>
                      <div className="action-icons">
                        <svg className="action-icon edit" viewBox="0 0 24 24" onClick={() => openModal(idx)}>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        <svg className="action-icon delete" viewBox="0 0 24 24" onClick={() => handleDelete(idx)}>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content user-modal">
            <div className="modal-header">
              <h2>{editIndex !== null ? 'Edit User' : 'Add New User'}</h2>
              <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            </div>

            <div className="step-indicator">
              {[1, 2, 3].map((s) => (
                <Fragment key={s}>
                  {s > 1 && <div className="step-indicator-line"></div>}
                  <div className={`step-indicator-step ${step >= s ? 'active' : ''}`}>
                    <div className="step-indicator-circle">{s}</div>
                    <div className="step-indicator-label">{s === 1 ? 'Personal Info' : s === 2 ? 'Role & Access' : 'Confirmation'}</div>
                  </div>
                </Fragment>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} readOnly={editIndex !== null} />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="button" className="btn-next" onClick={() => setStep(2)}>Next</button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                        <option value="user">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                        <option value="">Select</option>
                        <option>IT Department</option>
                        <option>Human Resources</option>
                        <option>Administration</option>
                        <option>Finance</option>
                        <option>College</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                    <button type="button" className="btn-next" onClick={() => setStep(3)}>Next</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <p className="confirmation-text">Please review the details below before submitting.</p>
                  <div className="confirmation-grid">
                    <div className="confirmation-group"><div className="confirmation-label">Name</div><div className="confirmation-value">{form.firstName} {form.lastName}</div></div>
                    <div className="confirmation-group"><div className="confirmation-label">Email</div><div className="confirmation-value">{form.email}</div></div>
                    <div className="confirmation-group"><div className="confirmation-label">Role</div><div className="confirmation-value">{form.role === 'admin' ? 'Admin' : 'Staff'}</div></div>
                    <div className="confirmation-group"><div className="confirmation-label">Department</div><div className="confirmation-value">{form.department}</div></div>
                    <div className="confirmation-group"><div className="confirmation-label">Status</div><div className="confirmation-value">{form.status}</div></div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                    <button type="submit" className="btn-primary">{editIndex !== null ? 'Save Changes' : 'Add User'}</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

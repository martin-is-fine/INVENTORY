import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      // Fetch pending requests with requestor profile info
      const { data: pendingData } = await supabase
        .from('requests')
        .select('*, profiles:requestor_id(full_name)')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });

      // Fetch counts
      const [pRes, aRes, rRes] = await Promise.all([
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'Approved'),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'Rejected'),
      ]);

      setRequests(pendingData || []);
      setCounts({ pending: pRes.count || 0, approved: aRes.count || 0, rejected: rRes.count || 0 });
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
    setLoading(false);
  }

  async function handleAction(id, status) {
    const req = requests.find((r) => r.id === id);
    const name = req?.profiles?.full_name || 'Unknown';
    if (!confirm(`Are you sure you want to set request from ${name} as ${status}?`)) return;

    const { error } = await supabase
      .from('requests')
      .update({ status, approved_by: 'Admin', remarks: `${status} by admin`, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) { alert('Error: ' + error.message); return; }
    alert(`Request from ${name} has been ${status}.`);
    fetchRequests();
  }

  function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Requests Approvals</h1>
          <p>Manage pending requests and approvals</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading requests...</p></div>
        ) : (
          <>
            <div className="summary-boxes">
              <div className="summary-box pending">
                <div className="summary-icon pending">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                </div>
                <div className="summary-number">{counts.pending}</div>
                <div className="summary-label">Pending Requests</div>
              </div>
              <div className="summary-box approved">
                <div className="summary-icon approved">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                </div>
                <div className="summary-number">{counts.approved}</div>
                <div className="summary-label">Approved Requests</div>
              </div>
              <div className="summary-box rejected">
                <div className="summary-icon rejected">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.47 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zM15.41 7.41L12 10.83 8.59 7.41 7.17 8.83 10.59 12l-3.42 3.17 1.42 1.42L12 13.41l3.41 3.42 1.42-1.42L13.41 12l3.42-3.17z" /></svg>
                </div>
                <div className="summary-number">{counts.rejected}</div>
                <div className="summary-label">Rejected Requests</div>
              </div>
            </div>

            <div className="requests-table-container">
              <div className="section-header"><h2>Pending Requests</h2></div>
              <table className="inventory-table">
                <thead>
                  <tr><th>Requestor</th><th>Item</th><th>Quantity</th><th>Department</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No pending requests.</td></tr>
                  ) : requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div className="requestor-cell">
                          <div className="requestor-avatar">{getInitials(r.profiles?.full_name)}</div>
                          <span>{r.profiles?.full_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="item-name-cell">{r.item_name}</td>
                      <td>{r.quantity}</td>
                      <td>{r.department}</td>
                      <td><span className="status-badge pending">Pending</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-approve" title="Approve" onClick={() => handleAction(r.id, 'Approved')}>
                            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                          </button>
                          <button className="btn-reject" title="Reject" onClick={() => handleAction(r.id, 'Rejected')}>
                            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

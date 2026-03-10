import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { userNavItems } from './userNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

const badgeMap = { Pending: 'badge badge-pending', Approved: 'badge badge-approved', Rejected: 'badge badge-rejected' };

export default function MyRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!profile?.id) { setLoading(false); return; }
      const { data } = await supabase
        .from('requests')
        .select('*')
        .eq('requestor_id', profile.id)
        .order('created_at', { ascending: false });

      const reqs = data || [];
      setRequests(reqs);
      setCounts({
        total: reqs.length,
        pending: reqs.filter((r) => r.status === 'Pending').length,
        approved: reqs.filter((r) => r.status === 'Approved').length,
        rejected: reqs.filter((r) => r.status === 'Rejected').length,
      });
      setLoading(false);
    }
    fetch();
  }, [profile]);

  return (
    <div className="container">
      <Sidebar navItems={userNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>My Requests</h1>
          <p>Track all requests you have submitted.</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading requests...</p></div>
        ) : (
          <>
            <section className="dashboard-card">
              <div className="request-summary">
                <div className="summary-card"><h4>Total Requests</h4><p>{counts.total}</p></div>
                <div className="summary-card"><h4>Pending Requests</h4><p>{counts.pending}</p></div>
                <div className="summary-card"><h4>Approved Requests</h4><p>{counts.approved}</p></div>
                <div className="summary-card"><h4>Rejected Requests</h4><p>{counts.rejected}</p></div>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>Request List</h2>
              <div className="inventory-table-container">
                <table className="inventory-table">
                  <thead>
                    <tr><th>ID</th><th>Item</th><th>Quantity</th><th>Date Requested</th><th>Status</th><th>Approved By</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No requests yet. Submit one from the Submit Request page.</td></tr>
                    ) : requests.map((r) => (
                      <tr key={r.id}>
                        <td>REQ-{String(r.id).padStart(3, '0')}</td>
                        <td>{r.item_name}</td>
                        <td>{r.quantity}</td>
                        <td>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td><span className={badgeMap[r.status] || 'badge'}>{r.status}</span></td>
                        <td>{r.approved_by || '—'}</td>
                        <td>{r.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

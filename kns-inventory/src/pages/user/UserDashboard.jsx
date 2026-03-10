import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { userNavItems } from './userNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function UserDashboard() {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(' ')[0] || 'User';
  const [assignedItems, setAssignedItems] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [counts, setCounts] = useState({ assigned: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!profile?.id) { setLoading(false); return; }
      try {
        // Items assigned to this user
        const { data: items } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('assigned_to', profile.id)
          .limit(5);

        // User's recent requests
        const { data: reqs } = await supabase
          .from('requests')
          .select('*')
          .eq('requestor_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Counts
        const { count: pendingCount } = await supabase
          .from('requests').select('*', { count: 'exact', head: true })
          .eq('requestor_id', profile.id).eq('status', 'Pending');

        const { count: approvedCount } = await supabase
          .from('requests').select('*', { count: 'exact', head: true })
          .eq('requestor_id', profile.id).eq('status', 'Approved');

        setAssignedItems(items || []);
        setRecentRequests(reqs || []);
        setCounts({
          assigned: (items || []).length,
          pending: pendingCount || 0,
          approved: approvedCount || 0,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    }
    fetch();
  }, [profile]);

  const statusBadge = (status) => {
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  return (
    <div className="container">
      <Sidebar navItems={userNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Welcome Back, {name}! Here's what's happening with your inventory and requests.</h1>
          <p>Your personalized overview of assigned items and recent requests.</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading dashboard...</p></div>
        ) : (
          <>
            <section className="dashboard-card">
              <div className="dashboard-summary">
                <div className="summary-card">
                  <h4>Items Assigned to You</h4>
                  <p>{counts.assigned}</p>
                </div>
                <div className="summary-card">
                  <h4>Pending Requests</h4>
                  <p>{counts.pending}</p>
                </div>
                <div className="summary-card">
                  <h4>Approved Requests</h4>
                  <p>{counts.approved}</p>
                </div>
              </div>
            </section>

            <div className="dashboard-grid">
              <section className="dashboard-card">
                <h2>Your Assigned Items</h2>
                <div className="inventory-table-container">
                  <table className="inventory-table">
                    <thead>
                      <tr><th>Item</th><th>Category</th><th>Condition</th></tr>
                    </thead>
                    <tbody>
                      {assignedItems.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No items assigned to you yet.</td></tr>
                      ) : assignedItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td><span className="badge badge-active">{item.condition}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="dashboard-card">
                <h2>Recent Requests</h2>
                <div className="recent-movements-container">
                  <table className="inventory-table">
                    <thead>
                      <tr><th>Item</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {recentRequests.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No requests yet.</td></tr>
                      ) : recentRequests.map((r) => (
                        <tr key={r.id}>
                          <td>{r.item_name}</td>
                          <td>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td><span className={statusBadge(r.status)}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

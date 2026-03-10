import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { userNavItems } from './userNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function MyInventory() {
  const { profile } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (!profile?.id) { setLoading(false); return; }
      const { data } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('assigned_to', profile.id)
        .order('name');
      setItems(data || []);
      setLoading(false);
    }
    fetch();
  }, [profile]);

  const filtered = items.filter((row) => {
    const q = filter.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.category.toLowerCase().includes(q) || (row.condition || '').toLowerCase().includes(q);
  });

  function exportCSV() {
    const header = 'Item,Category,Department,Quantity,Condition';
    const rows = filtered.map((r) => `"${r.name}","${r.category}","${r.department}",${r.quantity},"${r.condition}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-inventory.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const totalAssigned = items.length;
  const activeItems = items.filter((i) => i.condition === 'Good' || i.condition === 'Excellent').length;
  const needsAttention = items.filter((i) => i.condition === 'Fair' || i.condition === 'Poor' || i.condition === 'Needs Repair').length;

  return (
    <div className="container">
      <Sidebar navItems={userNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>My Assigned Items</h1>
          <p>Items currently assigned to you</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading inventory...</p></div>
        ) : (
          <>
            <section className="dashboard-card">
              <div className="section-header">
                <h2>Inventory List</h2>
                <div className="filter-bar">
                  <input type="text" className="filter-input" placeholder="Search inventory..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                  <button className="table-action-btn" onClick={exportCSV}>
                    <svg className="btn-icon" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4V7h3l-5-5z" /></svg>
                    <span>Export</span>
                  </button>
                </div>
              </div>
              <div className="inventory-table-container">
                <table className="inventory-table my-inventory-table">
                  <thead>
                    <tr><th>Item</th><th>Category</th><th>Department</th><th>Quantity</th><th>Condition</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#999', padding: 20 }}>No items assigned to you yet.</td></tr>
                    ) : filtered.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.category}</td>
                        <td>{row.department}</td>
                        <td>{row.quantity}</td>
                        <td><span className={`badge ${row.condition === 'Good' || row.condition === 'Excellent' ? 'badge-active' : 'badge-pending'}`}>{row.condition}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dashboard-card">
              <h2>Inventory Summary</h2>
              <div className="inventory-summary">
                <div className="summary-card"><h4>Total Assigned</h4><p>{totalAssigned} items</p></div>
                <div className="summary-card"><h4>Good Condition</h4><p>{activeItems} items</p></div>
                <div className="summary-card"><h4>Needs Attention</h4><p>{needsAttention} items</p></div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

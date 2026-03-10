import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

function badgeClass(condition) {
  if (condition === 'Good' || condition === 'Excellent') return 'condition-badge good';
  if (condition === 'Needs Repair' || condition === 'Fair') return 'condition-badge needs-repair';
  return 'condition-badge spoiled';
}

export default function Condition() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('inventory_items').select('*').order('name');
      setItems(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const total = items.length;
  const goodCount = items.filter((i) => i.condition === 'Good' || i.condition === 'Excellent').length;
  const repairCount = items.filter((i) => i.condition === 'Fair' || i.condition === 'Needs Repair').length;
  const spoiledCount = items.filter((i) => i.condition === 'Poor' || i.condition === 'Spoiled').length;

  // Brand distribution
  const brands = {};
  items.forEach((i) => { const b = i.brand || 'Unspecified'; brands[b] = (brands[b] || 0) + 1; });

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Condition</h1>
            <p>Detailed view of item status</p>
          </div>
          <button className="btn-secondary" onClick={() => navigate('/admin/inventory')}>Back to Inventory</button>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading conditions...</p></div>
        ) : (
          <>
            <div className="condition-summary-grid">
              <div className="condition-summary-card">
                <span className="summary-title">Total Items</span>
                <div className="summary-main-val">{total}</div>
                <div className="summary-sub-items">
                  <div className="sub-item"><span className="sub-label">All Categories</span></div>
                </div>
              </div>
              <div className="condition-summary-card">
                <span className="summary-title">Brand Distribution</span>
                <div className="summary-sub-items">
                  {Object.entries(brands).map(([brand, count]) => (
                    <div className="sub-item" key={brand}><span className="sub-label">{brand}:</span><span className="sub-val">{count}</span></div>
                  ))}
                </div>
              </div>
              <div className="condition-summary-card green">
                <span className="summary-title">Good Condition</span>
                <div className="summary-main-val">{goodCount}</div>
                <div className="summary-sub-items">
                  <div className="sub-item"><span className="sub-label">Status:</span><span className="sub-val">Optimal</span></div>
                </div>
              </div>
              <div className="condition-summary-card yellow">
                <span className="summary-title">Issue Reported</span>
                <div className="summary-sub-items">
                  <div className="sub-item"><span className="sub-label">Needs Repair:</span><span className="sub-val">{repairCount}</span></div>
                  <div className="sub-item"><span className="sub-label">Poor/Spoiled:</span><span className="sub-val">{spoiledCount}</span></div>
                </div>
              </div>
            </div>

            <div className="inventory-table-container">
              <div className="table-header"><h2>Detailed Condition Records</h2></div>
              <table className="inventory-table">
                <thead>
                  <tr><th>#</th><th>Item Name</th><th>Category</th><th>Department</th><th>Qty</th><th>Condition</th></tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td><td>{item.name}</td><td>{item.category}</td><td>{item.department}</td><td>{item.quantity}</td>
                      <td><span className={badgeClass(item.condition)}>{item.condition}</span></td>
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

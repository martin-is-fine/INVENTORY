import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function Reports() {
  const [categoryData, setCategoryData] = useState([]);
  const [stockStatus, setStockStatus] = useState({ adequate: 0, low: 0, critical: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data: items } = await supabase.from('inventory_items').select('category, quantity');
      if (items) {
        // Category aggregation
        const catMap = {};
        let adequate = 0, low = 0, critical = 0;
        items.forEach((item) => {
          catMap[item.category] = (catMap[item.category] || 0) + item.quantity;
          if (item.quantity >= 10) adequate += item.quantity;
          else if (item.quantity >= 3) low += item.quantity;
          else critical += item.quantity;
        });
        const maxVal = Math.max(...Object.values(catMap), 1);
        const colors = ['blue', 'green', 'purple', 'orange', 'red'];
        setCategoryData(Object.entries(catMap).map(([label, value], i) => ({
          label, value: `${value} items`, width: `${Math.round((value / maxVal) * 100)}%`, color: colors[i % colors.length],
        })));
        setStockStatus({ adequate, low, critical });
      }
      setLoading(false);
    }
    fetch();
  }, []);

  async function exportCSV(type) {
    let csv = '';
    if (type === 'Inventory Summary') {
      const { data } = await supabase.from('inventory_items').select('*');
      csv = 'Name,Category,Department,Quantity,Condition\n' +
        (data || []).map((i) => `"${i.name}","${i.category}","${i.department}",${i.quantity},"${i.condition}"`).join('\n');
    } else if (type === 'Movement Report') {
      const { data } = await supabase.from('stock_movements').select('*').order('created_at', { ascending: false });
      csv = 'Date,Item,Type,From,To,Quantity,Notes\n' +
        (data || []).map((m) => `"${new Date(m.created_at).toLocaleDateString()}","${m.item_name}","${m.movement_type}","${m.from_location}","${m.to_location}",${m.quantity},"${m.notes || ''}"`).join('\n');
    } else if (type === 'Request Log') {
      const { data } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
      csv = 'ID,Item,Quantity,Priority,Status,Date\n' +
        (data || []).map((r) => `${r.id},"${r.item_name}",${r.quantity},"${r.priority}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"`).join('\n');
    } else if (type === 'Low Stock Alert') {
      const { data } = await supabase.from('inventory_items').select('*').lt('quantity', 5);
      csv = 'Name,Category,Department,Quantity,Condition\n' +
        (data || []).map((i) => `"${i.name}","${i.category}","${i.department}",${i.quantity},"${i.condition}"`).join('\n');
    } else {
      alert(`Generating ${type}...`);
      return;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type.toLowerCase().replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Reports</h1>
          <p>Generate and view inventory reports</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading reports...</p></div>
        ) : (
          <>
            <div className="reports-grid">
              <div className="report-card">
                <h2>Inventory Report</h2>
                {categoryData.length === 0 ? (
                  <p style={{ color: '#999' }}>No inventory data yet.</p>
                ) : categoryData.map((item) => (
                  <div className="chart-item" key={item.label}>
                    <div className="chart-info">
                      <span className="chart-label">{item.label}</span>
                      <span className="chart-value">{item.value}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className={`progress-bar ${item.color}`} style={{ width: item.width }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="report-card">
                <h2>Stock Status</h2>
                <div className="status-list">
                  <div className="status-item">
                    <div className="status-label-group"><div className="status-dot green"></div><span>Adequate Stock</span></div>
                    <span className="chart-value">{stockStatus.adequate.toLocaleString()} items</span>
                  </div>
                  <div className="status-item">
                    <div className="status-label-group"><div className="status-dot yellow"></div><span>Low Stock</span></div>
                    <span className="chart-value">{stockStatus.low.toLocaleString()} items</span>
                  </div>
                  <div className="status-item">
                    <div className="status-label-group"><div className="status-dot red"></div><span>Critical Stock</span></div>
                    <span className="chart-value">{stockStatus.critical.toLocaleString()} items</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-options-card">
              <h2>Report Options</h2>
              <div className="options-grid">
                {[{ label: 'Inventory Summary', cls: 'blue', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
                { label: 'Movement Report', cls: 'green', icon: 'M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z' },
                { label: 'Low Stock Alert', cls: 'orange', icon: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
                { label: 'Usage Trends', cls: 'purple', icon: 'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z' },
                { label: 'Request Log', cls: 'red', icon: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z' },
                { label: 'Export Data', cls: 'indigo', icon: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z' }].map((opt) => (
                  <button key={opt.label} className={`option-btn ${opt.cls}`} onClick={() => exportCSV(opt.label)}>
                    <svg viewBox="0 0 24 24"><path d={opt.icon} /></svg>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

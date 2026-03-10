import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalItems: 0, lowStock: 0, pendingRequests: 0, activeUsers: 0 });
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // Total inventory items count
        const { count: totalItems } = await supabase
          .from('inventory_items').select('*', { count: 'exact', head: true });

        // Low stock (quantity < 5)
        const { count: lowStock } = await supabase
          .from('inventory_items').select('*', { count: 'exact', head: true })
          .lt('quantity', 5);

        // Pending requests count
        const { count: pendingRequests } = await supabase
          .from('requests').select('*', { count: 'exact', head: true })
          .eq('status', 'Pending');

        // Active users count
        const { count: activeUsers } = await supabase
          .from('profiles').select('*', { count: 'exact', head: true })
          .eq('status', 'Active');

        setStats({
          totalItems: totalItems || 0,
          lowStock: lowStock || 0,
          pendingRequests: pendingRequests || 0,
          activeUsers: activeUsers || 0,
        });

        // Recent movements
        const { data: movData } = await supabase
          .from('stock_movements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setMovements(movData || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const movementIcon = (type) => {
    if (type === 'Issue') return { cls: 'down', d: 'M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z' };
    if (type === 'Return') return { cls: 'up', d: 'M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z' };
    return { cls: 'swap', d: 'M14 6.4l-5.29 5.29c-.39.39-.39 1.02 0 1.41l5.29 5.29c.63.63 1.71.18 1.71-.71V14h3c1.1 0 2-.9 2-2s-.9-2-2-2h-3V7.11c0-.89-1.08-1.34-1.71-.71zM11 10H8V7.11c0-.89-1.08-1.34-1.71-.71L1 11.69c-.39.39-.39 1.02 0 1.41l5.29 5.29c.63.63 1.71.18 1.71-.71V14h3c1.1 0 2-.9 2-2s-.9-2-2-2z' };
  };

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading dashboard...</p></div>
        ) : (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Total Items</span>
                  <span className="stat-value">{stats.totalItems.toLocaleString()}</span>
                </div>
                <div className="stat-icon blue">
                  <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Low Stock</span>
                  <span className="stat-value">{stats.lowStock}</span>
                </div>
                <div className="stat-icon yellow">
                  <svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Pending Requests</span>
                  <span className="stat-value">{stats.pendingRequests}</span>
                </div>
                <div className="stat-icon orange">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <span className="stat-label">Active Users</span>
                  <span className="stat-value">{stats.activeUsers}</span>
                </div>
                <div className="stat-icon green">
                  <svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                </div>
              </div>
            </section>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Recent Stock Movements</h2>
                <div className="movements-list">
                  {movements.length === 0 ? (
                    <p style={{ color: '#999', padding: 16 }}>No stock movements recorded yet.</p>
                  ) : movements.map((m) => {
                    const icon = movementIcon(m.movement_type);
                    return (
                      <div className="movement-item" key={m.id}>
                        <div className={`movement-icon ${icon.cls}`}>
                          <svg viewBox="0 0 24 24"><path d={icon.d} /></svg>
                        </div>
                        <div className="movement-details">
                          <span className="item-name">{m.item_name}</span>
                          <span className="item-meta">{m.movement_type} — {m.from_location} → {m.to_location}</span>
                        </div>
                        <span className="movement-time">{timeAgo(m.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="dashboard-card">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <button className="action-btn blue" onClick={() => navigate('/admin/inventory')}>
                    <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                    <span>Manage Inventory</span>
                  </button>
                  <button className="action-btn green" onClick={() => navigate('/admin/stock-movement')}>
                    <svg viewBox="0 0 24 24"><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" /></svg>
                    <span>Stock Movement</span>
                  </button>
                  <button className="action-btn orange" onClick={() => navigate('/admin/requests')}>
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                    <span>View Requests</span>
                  </button>
                  <button className="action-btn purple" onClick={() => navigate('/admin/reports')}>
                    <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                    <span>Generate Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

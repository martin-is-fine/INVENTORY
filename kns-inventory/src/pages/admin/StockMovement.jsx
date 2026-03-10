import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Dashboard.css';

export default function StockMovement() {
  const { profile } = useAuth();
  const [movements, setMovements] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [form, setForm] = useState({ type: '', item: '', quantity: '', recipient: '', notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const [movRes, itemRes] = await Promise.all([
        supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('inventory_items').select('name'),
      ]);
      setMovements(movRes.data || []);
      setInventoryItems((itemRes.data || []).map((i) => i.name));
      setLoading(false);
    }
    fetch();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    let from_location = 'Warehouse', to_location = form.recipient;
    if (form.type === 'Return') { from_location = form.recipient; to_location = 'Warehouse'; }
    else if (form.type === 'Transfer') { from_location = 'IT Department'; to_location = form.recipient; }

    const { data, error } = await supabase.from('stock_movements').insert([{
      item_name: form.item,
      movement_type: form.type,
      from_location,
      to_location,
      quantity: parseInt(form.quantity),
      notes: form.notes,
      created_by: profile?.id || null,
    }]).select();

    if (error) { alert('Error recording movement: ' + error.message); return; }
    setMovements([...(data || []), ...movements]);
    setForm({ type: '', item: '', quantity: '', recipient: '', notes: '' });
    alert('Stock movement recorded successfully!');
  }

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Stock Movement</h1>
          <p>Track item movements between departments and users</p>
        </header>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading...</p></div>
        ) : (
          <>
            <section className="movement-form-container">
              <div className="section-header"><h2>Record Stock Movement</h2></div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Movement Type</label>
                    <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="" disabled>Select type</option>
                      <option value="Issue">Issue</option>
                      <option value="Return">Return</option>
                      <option value="Transfer">Transfer</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Item Name</label>
                    <select required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}>
                      <option value="" disabled>Select item</option>
                      {inventoryItems.map((name) => <option key={name}>{name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" min="1" required placeholder="Enter quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Recipient</label>
                    <input type="text" required placeholder="User / Department" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea placeholder="Additional notes" rows="3" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <button type="submit" className="submit-btn">Submit Movement</button>
                  </div>
                </div>
              </form>
            </section>

            <section className="recent-movements-container">
              <div className="section-header"><h2>Recent Movements</h2></div>
              <table className="inventory-table">
                <thead>
                  <tr><th>Date</th><th>Item</th><th>Type</th><th>From</th><th>To</th><th>Quantity</th></tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.created_at).toLocaleDateString()}</td>
                      <td className="item-name-cell">{m.item_name}</td>
                      <td><span className={`badge ${m.movement_type.toLowerCase()}`}>{m.movement_type}</span></td>
                      <td>{m.from_location}</td>
                      <td>{m.to_location}</td>
                      <td>{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

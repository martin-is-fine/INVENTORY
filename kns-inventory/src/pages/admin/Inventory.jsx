import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { adminNavItems } from './adminNav';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', department: '', quantity: 1, condition: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [itemsRes, catRes, deptRes] = await Promise.all([
        supabase.from('inventory_items').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('name').order('name'),
        supabase.from('departments').select('name').order('name'),
      ]);
      setItems(itemsRes.data || []);
      setCategories((catRes.data || []).map((c) => c.name));
      setDepartments((deptRes.data || []).map((d) => d.name));
    } catch (err) {
      setError('Failed to load inventory data.');
    }
    setLoading(false);
  }

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || item.department === deptFilter;
    const matchCat = !catFilter || item.category === catFilter;
    return matchSearch && matchDept && matchCat;
  });

  function openModal(item = null) {
    if (item) {
      setForm({ name: item.name, category: item.category, department: item.department, quantity: item.quantity, condition: item.condition });
      setEditId(item.id);
    } else {
      setForm({ name: '', category: '', department: '', quantity: 1, condition: '' });
      setEditId(null);
    }
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category || !form.department || !form.condition) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      if (editId !== null) {
        const { error } = await supabase.from('inventory_items').update({ ...form }).eq('id', editId);
        if (error) throw error;
        alert(`Item "${form.name}" updated successfully!`);
      } else {
        const { error } = await supabase.from('inventory_items').insert([{ ...form }]);
        if (error) throw error;
        alert(`Item "${form.name}" added successfully!`);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    }
  }

  async function handleDelete(id, name) {
    if (confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) { alert('Error deleting: ' + error.message); return; }
      setItems(items.filter((item) => item.id !== id));
    }
  }

  async function handleCategoryChange(value) {
    if (value === '-add-new-') {
      const newVal = prompt('Enter new category name:');
      if (newVal && newVal.trim()) {
        const trimmed = newVal.trim();
        await supabase.from('categories').insert([{ name: trimmed }]);
        setCategories([...categories, trimmed]);
        setForm({ ...form, category: trimmed });
      }
    } else {
      setForm({ ...form, category: value });
    }
  }

  async function handleDepartmentChange(value) {
    if (value === '-add-new-') {
      const newVal = prompt('Enter new department name:');
      if (newVal && newVal.trim()) {
        const trimmed = newVal.trim();
        await supabase.from('departments').insert([{ name: trimmed }]);
        setDepartments([...departments, trimmed]);
        setForm({ ...form, department: trimmed });
      }
    } else {
      setForm({ ...form, department: value });
    }
  }

  return (
    <div className="container">
      <Sidebar navItems={adminNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Inventories</h1>
          <p>Manage and track your inventory items.</p>
        </header>

        {error && <div className="error-alert">{error}</div>}

        {loading ? (
          <div className="page-loading"><div className="loading-spinner"></div><p className="loading-text">Loading inventory...</p></div>
        ) : (
          <>
            <div className="search-filter-bar">
              <div className="search-container">
                <input type="text" placeholder="Search for Inventory Items" value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="search-btn" onClick={() => { }}>Search</button>
              </div>
              <select className="filter-btn" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="filter-btn" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="inventory-table-container">
              <div className="table-header">
                <h2>Inventory List</h2>
                <button className="add-btn" onClick={() => openModal()}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                  Add Item
                </button>
              </div>
              {filtered.length === 0 ? (
                <div className="no-results-message">No items found matching your filters.</div>
              ) : (
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Item</th><th>Category</th><th>Department</th><th>Quantity</th><th>Condition</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => (
                      <tr key={item.id}>
                        <td className="item-name-cell">{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.department}</td>
                        <td>{item.quantity}</td>
                        <td><Link to="/admin/condition" className="condition-link">View Condition</Link></td>
                        <td>
                          <div className="action-icons">
                            <svg className="action-icon edit" viewBox="0 0 24 24" onClick={() => openModal(item)}>
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                            <svg className="action-icon delete" viewBox="0 0 24 24" onClick={() => handleDelete(item.id, item.name)}>
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {showModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editId !== null ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
              <span className="close-modal" onClick={() => setShowModal(false)}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" required placeholder="Enter item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select required value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
                    <option value="">-select-</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="-add-new-">-add new-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select required value={form.department} onChange={(e) => handleDepartmentChange(e.target.value)}>
                    <option value="">-select-</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    <option value="-add-new-">-add new-</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" required min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select required value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                    <option value="">-select-</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editId !== null ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

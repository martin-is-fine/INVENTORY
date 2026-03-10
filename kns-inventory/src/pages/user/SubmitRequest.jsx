import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { userNavItems } from './userNav';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import '../../styles/Dashboard.css';

export default function SubmitRequest() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    requestType: '', department: profile?.department || '', requestedBy: profile?.full_name || 'User',
    priority: '', itemName: '', category: '', quantity: 1, requiredDate: '', description: '',
  });

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        department: profile.department || prev.department,
        requestedBy: profile.full_name || prev.requestedBy,
      }));
    }
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from('requests').insert([{
      requestor_id: profile.id,
      request_type: form.requestType,
      item_name: form.itemName,
      category: form.category,
      quantity: parseInt(form.quantity),
      priority: form.priority,
      department: form.department,
      description: form.description,
      required_date: form.requiredDate || null,
    }]);

    if (error) {
      alert('Error submitting request: ' + error.message);
      setSubmitting(false);
      return;
    }
    alert('Request submitted successfully!');
    navigate('/user/my-requests');
  }

  return (
    <div className="container">
      <Sidebar navItems={userNavItems} />
      <main className="main-content">
        <header className="content-header">
          <h1>Submit New Request</h1>
          <p>Fill out the form below to submit a new inventory request.</p>
        </header>

        <section className="dashboard-card">
          <div className="section-header"><h2>Request Details</h2></div>
          <form onSubmit={handleSubmit}>
            <div className="section-header"><h2>Request Information</h2></div>
            <div className="form-row">
              <div className="form-group">
                <label>Request Type</label>
                <select required value={form.requestType} onChange={(e) => setForm({ ...form, requestType: e.target.value })}>
                  <option value="" disabled>Select request type</option>
                  <option value="new">New Request</option>
                  <option value="replacement">Replacement</option>
                  <option value="repair">Repair</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" value={form.department} readOnly />
              </div>
              <div className="form-group">
                <label>Requested By</label>
                <input type="text" value={form.requestedBy} readOnly />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select required value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="" disabled>Select priority</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="section-header"><h2>Item Details</h2></div>
            <div className="form-row">
              <div className="form-group">
                <label>Item Name</label>
                <input type="text" required placeholder="Enter item name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="" disabled>Select category</option>
                  <option value="Computers">Computers</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Peripherals">Peripherals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Required Date</label>
                <input type="date" required value={form.requiredDate} onChange={(e) => setForm({ ...form, requiredDate: e.target.value })} />
              </div>
            </div>

            <div className="section-header"><h2>Additional Information</h2></div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Description</label>
                <textarea rows="4" placeholder="Please provide details about your request." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="form-footer">
              <button type="button" className="btn-cancel" onClick={() => navigate('/user/my-requests')}>Cancel</button>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

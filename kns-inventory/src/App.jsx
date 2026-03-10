import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Inventory from './pages/admin/Inventory';
import Condition from './pages/admin/Condition';
import StockMovement from './pages/admin/StockMovement';
import Requests from './pages/admin/Requests';
import Reports from './pages/admin/Reports';
import Users from './pages/admin/Users';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import MyInventory from './pages/user/MyInventory';
import SubmitRequest from './pages/user/SubmitRequest';
import MyRequests from './pages/user/MyRequests';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute role="admin"><Inventory /></ProtectedRoute>} />
      <Route path="/admin/condition" element={<ProtectedRoute role="admin"><Condition /></ProtectedRoute>} />
      <Route path="/admin/stock-movement" element={<ProtectedRoute role="admin"><StockMovement /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute role="admin"><Requests /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />

      {/* User */}
      <Route path="/user" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/my-inventory" element={<ProtectedRoute role="user"><MyInventory /></ProtectedRoute>} />
      <Route path="/user/submit-request" element={<ProtectedRoute role="user"><SubmitRequest /></ProtectedRoute>} />
      <Route path="/user/my-requests" element={<ProtectedRoute role="user"><MyRequests /></ProtectedRoute>} />
    </Routes>
  );
}

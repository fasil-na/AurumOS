import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import AcceptInvite from './components/Auth/AcceptInvite';
import SuperAdminDashboard from './components/Dashboard/SuperAdminDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import ProtectedRoute from './components/Shared/ProtectedRoute';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Super Admin') return <Navigate to="/super-admin" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/employee" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Super Admin']} />}>
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
            <Route path="/employee/*" element={<EmployeeDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

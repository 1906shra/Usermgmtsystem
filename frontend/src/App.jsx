import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanel from './pages/AdminPanel';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const { user } = useAuth();

  const home = user
    ? (user.role === 'admin' || user.role === 'manager' ? '/admin' : '/dashboard')
    : '/login';

  return (
    <Routes>
      {/* Public — LoginPage handles its own redirect if already logged in */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>

          {/* User dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Profile — all authenticated roles */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin + Manager */}
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="/admin"       element={<AdminPanel />} />
            <Route path="/users"       element={<UsersPage />} />
            <Route path="/users/:id"   element={<UserDetailPage />} />
          </Route>

        </Route>
      </Route>

      {/* Root → role-based home */}
      <Route path="/"  element={<Navigate to={home} replace />} />
      <Route path="*"  element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;

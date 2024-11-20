import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { AdminLayout } from './components/AdminLayout';
import { LoginForm } from './components/LoginForm';
import { Dashboard } from './pages/admin/Dashboard';
import { CustomerLayout } from './components/CustomerLayout';
import { Vendors } from './pages/admin/Vendors';
import { MenuItems } from './pages/admin/MenuItems';
import { Orders } from './pages/admin/Orders';

const queryClient = new QueryClient();

export default function App() {
  const { checkUser, loading } = useAuthStore();

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<CustomerLayout />} />

          {/* Admin Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="menu-items" element={<MenuItems />} />
            <Route path="orders" element={<Orders />} />
            {/* Add other admin routes here */}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
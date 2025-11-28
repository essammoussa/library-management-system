// AdminLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import { useRole } from '@/store/RoleContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { role, isAuthenticated } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'member') {
      navigate('/user/catalog');
    }
  }, [role, isAuthenticated, navigate]);

  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <main className="flex-1">
          <div className="border-b border-border p-4 bg-card">
            <SidebarTrigger />
          </div>
          <div className="p-6 lg:p-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;

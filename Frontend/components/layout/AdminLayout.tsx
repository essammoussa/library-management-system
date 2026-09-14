// AdminLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import { AthenaeumHeader } from "./AthenaeumHeader";
import { AthenaeumFooter } from "./AthenaeumFooter";
import { useRole } from '@/store/RoleContext';

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
      navigate('/user/borrowed');
    }
  }, [role, isAuthenticated, navigate]);

  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-parchment-bg font-sans-ui text-ink-primary">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Shared Athenaeum Top Navigation Bar (Offset by sidebar on desktop) */}
        <AthenaeumHeader className="lg:left-64" />

        {/* Dynamic Page Content */}
        <main className="flex-1 pt-24 pb-8 px-4 sm:px-6 lg:px-8 min-w-0">
          {children || <Outlet />}
        </main>

        {/* Shared Footer */}
        <AthenaeumFooter />
      </div>
    </div>
  );
}

export default AdminLayout;


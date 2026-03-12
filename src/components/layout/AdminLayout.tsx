// AdminLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar"; // Sidebar for admin navigation
import { useRole } from '@/store/RoleContext'; // Custom hook for role & auth state
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'; // Sidebar context & toggle

interface AdminLayoutProps {
  children?: React.ReactNode; // Optional children if layout wraps specific content
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { role, isAuthenticated } = useRole(); // Get current user role & auth status
  const navigate = useNavigate(); // For programmatic navigation

  // Redirect based on authentication & role
  useEffect(() => {
    if (!isAuthenticated) {
      // If user is not logged in, redirect to login page
      navigate('/login');
    } else if (role === 'member') {
      // If user is a member, redirect to user catalog
      navigate('/user/catalog');
    }
  }, [role, isAuthenticated, navigate]);

  // Prevent rendering layout if user is not admin or not logged in
  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  return (
    <SidebarProvider>
      {/* Container: flex layout with sidebar + main content */}
      <div className="flex min-h-screen w-full bg-background">
        {/* Admin sidebar navigation */}
        <AdminSidebar />

        {/* Main content area */}
        <main className="flex-1 relative">
          {/* Top bar with sidebar toggle (scrolled) */}
          <div className="border-b border-border p-4 bg-card">
            <SidebarTrigger />
          </div>

          {/* Floating Toggle for Mobile (Fixed while scrolling) */}
          <div className="fixed bottom-6 left-6 z-50 md:hidden">
            <SidebarTrigger className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl hover:bg-primary/90 transition-all duration-300 ring-4 ring-background" />
          </div>

          {/* Page content */}
          <div className="p-6 lg:p-8">
            {/* Render either children passed in or the nested route outlet */}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;

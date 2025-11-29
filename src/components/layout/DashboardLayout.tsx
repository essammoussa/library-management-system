// DashboardLayout.tsx
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar"; // Provides sidebar context for collapsible functionality
import AdminSidebar from "./AdminSidebar"; // Sidebar component for navigation
import { Navbar } from "./Navbar"; // Top navigation bar component

// Props for DashboardLayout
interface DashboardLayoutProps {
  children: ReactNode; // Page content passed into the layout
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    // Wrap everything with SidebarProvider to enable sidebar state/context
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar on the left */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top navigation bar */}
          <Navbar />

          {/* Page content */}
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;

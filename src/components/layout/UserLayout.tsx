// UserLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // For nested routing
import MemberSidebar from "./MemberSidebar"; // Sidebar for members
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // Sidebar context & toggle

interface Props {
  children?: React.ReactNode; // Optional children, otherwise Outlet will render nested routes
}

export default function UserLayout({ children }: Props) {
  return (
    // Provide sidebar context to all nested components
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <MemberSidebar />

        {/* Main content area */}
        <main className="flex-1 relative">
          {/* Top bar with sidebar trigger (scrolled) */}
          <div className="border-b border-border p-4 bg-card">
            <SidebarTrigger /> {/* Toggles sidebar collapse */}
          </div>

          {/* Floating Toggle for Mobile (Fixed while scrolling) */}
          <div className="fixed bottom-6 left-6 z-50 md:hidden">
            <SidebarTrigger className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl hover:bg-primary/90 transition-all duration-300 ring-4 ring-background" />
          </div>

          {/* Page content */}
          <div className="p-6 lg:p-8">
            {/* Render children if passed, otherwise render nested routes */}
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

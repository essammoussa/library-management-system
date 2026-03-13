// UserLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom"; // For nested routing
import MemberSidebar from "./MemberSidebar"; // Sidebar for members
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"; // Sidebar context & toggle

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


        {/* Floating Toggle for Mobile */}
        <div className="fixed bottom-6 left-6 z-50 md:hidden">
          <SidebarTrigger className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl hover:bg-primary/90 transition-all duration-300 ring-4 ring-background" />
        </div>

        {/* Main content area — no padding wrapping */}
        <main className="flex-1 relative">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
}

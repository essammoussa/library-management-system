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




        {/* Main content area — no padding wrapping */}
        <main className="flex-1 relative">
          {children || <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  );
}

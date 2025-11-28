// UserLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import MemberSidebar from "./MemberSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface Props {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <MemberSidebar />
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

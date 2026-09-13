import React from "react";
import { Outlet } from "react-router-dom";
import { AthenaeumHeader } from "./AthenaeumHeader";
import { AthenaeumFooter } from "./AthenaeumFooter";

interface Props {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: Props) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-parchment-bg font-sans-ui text-ink-primary antialiased selection:bg-gilded-light selection:text-archival-teal">
      {/* Shared Athenaeum Top Navigation Bar */}
      <AthenaeumHeader />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20">
        {children || <Outlet />}
      </main>

      {/* Shared Athenaeum Archival Footer */}
      <AthenaeumFooter />
    </div>
  );
}


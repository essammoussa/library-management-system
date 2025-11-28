import { BookMarked } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Navbar() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-4">
      <SidebarTrigger className="text-foreground" />
      <div className="flex items-center gap-2">
        <BookMarked className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold text-foreground">Library Management</h1>
      </div>
    </header>
  );
}

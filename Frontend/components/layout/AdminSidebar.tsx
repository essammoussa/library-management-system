import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '@/store/RoleContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const navigationItems = [
  { title: "Circulation Desk", url: "/admin", icon: "grid_view" },
  { title: "Inventory & Stacks", url: "/admin/books", icon: "auto_stories" },
  { title: "Patron Directory", url: "/admin/members", icon: "group" },
  { title: "Circulation Loans", url: "/admin/borrowing", icon: "swap_horiz" },
  { title: "Holds & Reserves", url: "/admin/reservations", icon: "bookmark_manager" },
  { title: "Fines & Lost Items", url: "/admin/fines", icon: "account_balance_wallet" },
];

export const AdminSidebar: React.FC = () => {
  const { logout } = useRole();
  const navigate = useNavigate();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setIsLogoutDialogOpen(false);
  };

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-border-archival shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex-col justify-between pt-6 pb-6 shrink-0 h-screen sticky top-0 font-sans-ui z-40">
      <div className="flex flex-col min-w-0">
        {/* Console Header */}
        <div className="px-6 pb-6 border-b border-border-archival/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gilded-amber animate-pulse shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted truncate whitespace-nowrap">
              Operational Console
            </span>
          </div>
          <p className="font-serif-display text-xl font-bold text-archival-teal mt-1 truncate whitespace-nowrap">
            Librarian Hub
          </p>
          <span className="text-[11px] text-ink-muted italic font-serif-body truncate whitespace-nowrap block">
            Terminal ID: CLR-092-B
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 px-3 mt-4">
          {navigationItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                  isActive
                    ? "bg-[#0f766e] text-white shadow-sm"
                    : "text-ink-muted hover:bg-parchment-subtle hover:text-archival-teal"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {item.icon}
              </span>
              <span className="truncate whitespace-nowrap">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Area: Shelf Capacity Meter & Sign Out */}
      <div className="px-5 space-y-4">
        {/* Shelf Capacity Widget from design */}
        <div className="p-3 rounded-lg bg-parchment-subtle border border-border-archival">
          <div className="flex items-center justify-between mb-1 text-[11px]">
            <span className="text-ink-muted font-medium truncate whitespace-nowrap">Shelf Capacity</span>
            <span className="text-archival-teal font-bold shrink-0">84%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e2e8f0] rounded overflow-hidden">
            <div className="h-full bg-archival-teal rounded w-[84%]" />
          </div>
          <span className="text-[10px] text-ink-muted/80 mt-1 block truncate whitespace-nowrap">
            Vault Rooms I–VI Active
          </span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">logout</span>
          <span className="truncate">Sign Out of Console</span>
        </button>
      </div>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-white border-border-archival font-sans-ui">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif-display text-archival-teal text-lg">
              Sign Out of Librarian Console
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-muted text-xs">
              Are you sure you want to end your current librarian session? Unsaved folio changes will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmLogout} 
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

export default AdminSidebar;

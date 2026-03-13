// AdminSidebar.tsx
import { 
  BookOpen, Users, ArrowLeftRight, Calendar, LayoutDashboard, DollarSign, LogOut, PanelLeft, ChevronLeft, ChevronRight 
} from "lucide-react"; // Icons for navigation
import { NavLink } from "@/components/NavLink"; // Custom NavLink for routing + active styling
import { useNavigate } from "react-router-dom"; // Navigation hook
import { useRole } from "@/store/RoleContext"; // Custom hook for auth & role
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"; // Sidebar components and context
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

import { cn } from "@/lib/utils";

// Navigation links for the admin panel
const navigationItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Books", url: "/admin/books", icon: BookOpen },
  { title: "Members", url: "/admin/members", icon: Users },
  { title: "Borrowing", url: "/admin/borrowing", icon: ArrowLeftRight },
  { title: "Reservations", url: "/admin/reservations", icon: Calendar },
  { title: "Fines", url: "/admin/fines", icon: DollarSign },
];

export function AdminSidebar() {
  const { state, isMobile } = useSidebar(); // Get sidebar state (collapsed/expanded)
  const { logout } = useRole();   // Get logout function from auth context
  const navigate = useNavigate(); // For programmatic navigation
  const isCollapsed = state === "collapsed" && !isMobile; // Only collapse labels on desktop

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Handle logout click
  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();          // Clear auth state
    navigate('/login'); // Redirect to login page
    setIsLogoutDialogOpen(false);
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar/90 backdrop-blur-xl border-none">
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-4 sticky top-0 z-10 bg-inherit backdrop-blur-md">
        {!isCollapsed && (
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
            Library Admin
          </span>
        )}
        <SidebarTrigger className={cn(
          "h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300",
          isCollapsed ? "mx-auto" : ""
        )}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        {/* Main Navigation Group */}
        <SidebarGroup>
          {/* Label moved to Header, but kept here for spacing if needed or removed */}
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Render each nav item */}
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:bg-white/10 text-white/60 hover:text-white"
                      activeClassName="bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    >
                      {/* Icon always visible */}
                      <item.icon className="h-5 w-5" />
                      {/* Show title only if sidebar is expanded */}
                      {!isCollapsed && <span className="text-sm tracking-tight">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button Group at Bottom */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout} 
                  className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:bg-destructive/20 hover:text-destructive text-white/60"
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="text-sm font-bold tracking-tight">Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}

export default AdminSidebar;

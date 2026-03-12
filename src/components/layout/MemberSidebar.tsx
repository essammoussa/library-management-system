// MemberSidebar.tsx
import { BookOpen, Book, Clock, CreditCard, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { NavLink } from "@/components/NavLink"; // Custom NavLink with active state
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import { useRole } from "@/store/RoleContext"; // Custom hook to access user role and logout
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
} from "@/components/ui/sidebar"; // Sidebar components from your UI library
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

// Menu items for member panel
const memberMenuItems = [
  { title: "Catalog", url: "/", icon: Book },
  { title: "My Books", url: "/user/borrowed", icon: BookOpen },
  { title: "Reservations", url: "/user/reservations", icon: Clock },
  { title: "My Fines", url: "/user/fines", icon: CreditCard },
  { title: "Profile", url: "/user/profile", icon: User },
];

export function MemberSidebar() {
  const { state } = useSidebar(); // Sidebar state: collapsed or expanded
  const { logout } = useRole(); // Logout function from role context
  const navigate = useNavigate(); // Router navigation
  const isCollapsed = state === "collapsed"; // Check if sidebar is collapsed
  const { isAuthenticated } = useRole();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Handle logout action
  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout(); // Clear auth state
    navigate("/login"); // Redirect to login page
    setIsLogoutDialogOpen(false);
  };

  return (
    // Main Sidebar wrapper
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="flex flex-row items-center justify-between px-4 py-4 border-b border-white/5 sticky top-0 z-10 bg-inherit backdrop-blur-md">
        {!isCollapsed && (
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">
            Member Panel
          </span>
        )}
        <SidebarTrigger className={cn(
          "h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all duration-300 md:hidden",
          isCollapsed ? "mx-auto" : ""
        )}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        {/* Member Panel Group */}
        <SidebarGroup>
          {/* Label moved to Header */}

          <SidebarGroupContent>
            <SidebarMenu>
              {memberMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 hover:bg-white/10 text-white/60 hover:text-white"
                      activeClassName="bg-primary text-white font-bold shadow-lg shadow-primary/20"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span className="text-sm tracking-tight">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout button fixed at the bottom */}
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

export default MemberSidebar;

// MemberSidebar.tsx
import { BookOpen, Book, Clock, CreditCard, User, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink"; // Custom NavLink with active state
import { useNavigate } from "react-router-dom"; // For programmatic navigation
import { useRole } from "@/store/RoleContext"; // Custom hook to access user role and logout
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"; // Sidebar components from your UI library

// Menu items for member panel
const memberMenuItems = [
  { title: "Catalog", url: "/user/catalog", icon: Book },
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

  // Handle logout action
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout(); // Clear auth state
      navigate("/login"); // Redirect to login page
    }
  };

  return (
    // Main Sidebar wrapper
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Member Panel Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed && "Member Panel"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {memberMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
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
                  className="hover:bg-destructive/20 hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span>Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default MemberSidebar;

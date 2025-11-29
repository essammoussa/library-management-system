// AdminSidebar.tsx
import { 
  BookOpen, Users, ArrowLeftRight, Calendar, LayoutDashboard, DollarSign, LogOut 
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"; // Sidebar components and context

// Navigation links for the admin panel
const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Books", url: "/books", icon: BookOpen },
  { title: "Members", url: "/members", icon: Users },
  { title: "Borrowing", url: "/borrowing", icon: ArrowLeftRight },
  { title: "Reservations", url: "/reservations", icon: Calendar },
  { title: "Fines", url: "/fines", icon: DollarSign },
];

export function AdminSidebar() {
  const { state } = useSidebar(); // Get sidebar state (collapsed/expanded)
  const { logout } = useRole();   // Get logout function from auth context
  const navigate = useNavigate(); // For programmatic navigation
  const isCollapsed = state === "collapsed"; // Boolean for sidebar collapsed state

  // Handle logout click
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();          // Clear auth state
      navigate('/login'); // Redirect to login page
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Main Navigation Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {/* Only show label if sidebar is expanded */}
            {!isCollapsed && "Admin Panel"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Render each nav item */}
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      {/* Icon always visible */}
                      <item.icon className="h-4 w-4" />
                      {/* Show title only if sidebar is expanded */}
                      {!isCollapsed && <span>{item.title}</span>}
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

export default AdminSidebar;

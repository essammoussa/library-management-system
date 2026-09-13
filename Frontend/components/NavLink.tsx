import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils"; // Utility to combine class names conditionally

// Extend React Router's NavLink props, but add support for optional class names
interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;          // Default className
  activeClassName?: string;    // Class to apply when the route is active
  pendingClassName?: string;   // Class to apply when the route is pending
}

// Use forwardRef so parent components can get the <a> ref if needed
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}         // Forward ref to underlying <a> element
        to={to}           // Destination path
        className={({ isActive, isPending }) =>
          // Combine default, active, and pending classes
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}        // Spread other props (like 'end', 'style', etc.)
      />
    );
  },
);

NavLink.displayName = "NavLink"; // Set display name for React DevTools

export { NavLink };

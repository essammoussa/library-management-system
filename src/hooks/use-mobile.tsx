import * as React from "react";

// Define the mobile breakpoint (px)
const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to detect if the current screen width is considered mobile
 * Returns a boolean: true if mobile, false if desktop
 */
export function useIsMobile() {
  // State to track if the viewport is mobile
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Create a media query to detect widths below the MOBILE_BREAKPOINT
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update state whenever the viewport width changes
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Listen for changes in the media query
    mql.addEventListener("change", onChange);

    // Set initial state
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup listener on unmount
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Always return a boolean (default to false if undefined)
  return !!isMobile;
}

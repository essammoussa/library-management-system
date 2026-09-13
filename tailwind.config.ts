import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Athenaeum Archival Design Tokens
        "parchment-bg": "#fbf9f4",
        "parchment-subtle": "#f4efe6",
        "parchment-card": "#ffffff",
        "parchment-base": "#f8fafc",
        "parchment-surface": "#f1f5f9",
        "border-archival": "#e8e0d0",
        "border-crisp": "#e2e8f0",
        "archival-teal": "#063b36",
        "archival-deep": "#042824",
        "archival-mid": "#0c4a43",
        "gilded-amber": "#b45309",
        "gilded-gold": "#d97706",
        "gilded-light": "#fef3c7",
        "ink-primary": "#1c1917",
        "ink-muted": "#57534e",
        "slate-text-primary": "#0f172a",
        "slate-text-secondary": "#334155",
        "status-available": "#059669",
        "status-reserved": "#b45309",
        "status-borrowed": "#2563eb",
        "status-unavailable": "#dc2626",
      },
      fontFamily: {
        "serif-display": ["Playfair Display", "Merriweather", "serif"],
        "serif-body": ["Merriweather", "Georgia", "serif"],
        "sans-ui": ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      spacing: {
        gutter: "1.25rem",
        "gutter-lg": "2rem",
        margin: "1rem",
        "margin-md": "2rem",
        "margin-lg": "3rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

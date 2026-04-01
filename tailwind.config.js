module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      colors: {
        background: "hsl(0, 0%, 98%)",
        foreground: "hsl(210, 15%, 20%)",
        border: "hsl(210, 10%, 80%)",
        input: "hsl(0, 0%, 100%)",
        ring: "hsl(210, 90%, 56%)",
        primary: {
          DEFAULT: "hsl(210, 90%, 56%)",
          foreground: "hsl(0, 0%, 100%)",
          hover: "hsl(210, 90%, 48%)",
          active: "hsl(210, 90%, 42%)",
        },
        secondary: {
          DEFAULT: "hsl(210, 85%, 46%)",
          foreground: "hsl(0, 0%, 100%)",
          hover: "hsl(210, 85%, 42%)",
          active: "hsl(210, 85%, 38%)",
        },
        tertiary: {
          DEFAULT: "hsl(190, 70%, 45%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        accent: {
          DEFAULT: "hsl(330, 70%, 52%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(210, 15%, 95%)",
          foreground: "hsl(210, 10%, 50%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(210, 15%, 20%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(210, 15%, 20%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 80%, 55%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        success: {
          DEFAULT: "hsl(145, 62%, 41%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        warning: {
          DEFAULT: "hsl(40, 95%, 50%)",
          foreground: "hsl(0, 0%, 15%)",
        },
        error: {
          DEFAULT: "hsl(0, 80%, 55%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        info: {
          DEFAULT: "hsl(210, 90%, 56%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        neutral: {
          50: "hsl(210, 20%, 98%)",
          100: "hsl(210, 15%, 95%)",
          200: "hsl(210, 15%, 90%)",
          300: "hsl(210, 10%, 80%)",
          400: "hsl(210, 10%, 65%)",
          500: "hsl(210, 10%, 50%)",
          600: "hsl(210, 10%, 40%)",
          700: "hsl(210, 15%, 30%)",
          800: "hsl(210, 20%, 20%)",
          900: "hsl(210, 25%, 10%)",
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(135deg, hsl(210, 90%, 56%), hsl(190, 70%, 45%))",
        "gradient-secondary":
          "linear-gradient(135deg, hsl(210, 85%, 46%), hsl(190, 70%, 45%))",
        "gradient-accent":
          "linear-gradient(135deg, hsl(330, 70%, 52%), hsl(280, 70%, 50%))",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px hsla(210, 20%, 20%, 0.05)",
        md: "0 2px 6px hsla(210, 20%, 20%, 0.1)",
        lg: "0 6px 12px hsla(210, 20%, 20%, 0.15)",
        xl: "0 10px 24px hsla(210, 20%, 20%, 0.2)",
      },
      fontSize: {
        h1: [
          "32px",
          { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.025em" },
        ],
        h2: [
          "24px",
          { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.025em" },
        ],
        h3: [
          "20px",
          { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.025em" },
        ],
        h4: [
          "18px",
          { lineHeight: "1.2", fontWeight: "500", letterSpacing: "-0.025em" },
        ],
        "body-lg": ["18px", { lineHeight: "1.5", fontWeight: "400" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "300" }],
        caption: ["12px", { lineHeight: "1.3", fontWeight: "300" }],
      },
      transitionTimingFunction: {
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
        "ease-in-out": "cubic-bezier(0.42, 0, 0.58, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "300ms",
        slow: "500ms",
      },
      maxWidth: {
        app: "1280px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-bottom": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "skeleton-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in": "fade-in 250ms ease-in-out",
        "slide-in-right": "slide-in-right 250ms ease-in-out",
        "slide-in-bottom": "slide-in-bottom 250ms ease-in-out",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

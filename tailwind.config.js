/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter Fallback", "sans-serif"],
        serif: ["var(--font-fraunces)", "Fraunces Fallback", "serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono Fallback", "monospace"],
      },
      borderRadius: {
        sm: "calc(var(--radius) * 0.6)",
        md: "calc(var(--radius) * 0.8)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.4)",
        "2xl": "calc(var(--radius) * 1.8)",
        "3xl": "calc(var(--radius) * 2.2)",
        "4xl": "calc(var(--radius) * 2.6)",
      },
      colors: {
        background: "oklch(0.985 0.008 95)",
        foreground: "oklch(0.27 0.02 145)",
        card: "oklch(1 0.004 95)",
        "card-foreground": "oklch(0.27 0.02 145)",
        popover: "oklch(1 0.004 95)",
        "popover-foreground": "oklch(0.27 0.02 145)",
        primary: "oklch(0.58 0.07 152)",
        "primary-foreground": "oklch(0.99 0.005 95)",
        secondary: "oklch(0.95 0.012 95)",
        "secondary-foreground": "oklch(0.35 0.03 150)",
        muted: "oklch(0.95 0.012 95)",
        "muted-foreground": "oklch(0.5 0.02 140)",
        accent: "oklch(0.85 0.04 145)",
        "accent-foreground": "oklch(0.25 0.06 150)",
        destructive: "oklch(0.577 0.245 27.325)",
        border: "oklch(0.9 0.012 95)",
        input: "oklch(0.9 0.012 95)",
        ring: "oklch(0.45 0.07 152)",
        chart: {
          1: "oklch(0.55 0.06 150)",
          2: "oklch(0.65 0.05 130)",
          3: "oklch(0.72 0.04 90)",
          4: "oklch(0.6 0.05 60)",
          5: "oklch(0.45 0.05 160)",
        },
        sidebar: "oklch(0.985 0.008 95)",
        "sidebar-foreground": "oklch(0.27 0.02 145)",
        "sidebar-primary": "oklch(0.15 0.07 152)",
        "sidebar-primary-foreground": "oklch(0.99 0.005 95)",
        "sidebar-accent": "oklch(0.92 0.02 110)",
        "sidebar-accent-foreground": "oklch(0.35 0.03 150)",
        "sidebar-border": "oklch(0.9 0.012 95)",
        "sidebar-ring": "oklch(0.55 0.06 150)",
      },
      keyframes: {
        // Puedes añadir animaciones personalizadas aquí si quieres
      },
      animation: {
        // Y aquí tus animaciones
      },
    },
  },
  plugins: [],
};
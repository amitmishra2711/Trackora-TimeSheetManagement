/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",

    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],

    theme: {
        extend: {
            colors: {
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",

                card: "rgb(var(--card) / <alpha-value>)",
                "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",

                primary: "rgb(var(--primary) / <alpha-value>)",
                "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",

                secondary: "rgb(var(--secondary) / <alpha-value>)",
                "secondary-foreground": "rgb(var(--secondary-foreground) / <alpha-value>)",

                muted: "rgb(var(--muted) / <alpha-value>)",
                "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",

                accent: "rgb(var(--accent) / <alpha-value>)",
                "accent-foreground": "rgb(var(--accent-foreground) / <alpha-value>)",

                destructive: "rgb(var(--destructive) / <alpha-value>)",

                border: "rgb(var(--border) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
            },

            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },

            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },

    plugins: [],
};
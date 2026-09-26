/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Stitch Color Palette
        obsidian: {
          DEFAULT: '#11110F',
          surface: '#191917',
          elevated: '#22221F',
          border: '#34332F',
        },
        amberGold: {
          DEFAULT: '#D99A3D',
          light: '#F1C46A',
          dark: '#B07525',
        },
        terracotta: {
          DEFAULT: '#D96B55',
          dark: '#B54934',
        },
        sage: {
          DEFAULT: '#6F9B87',
          light: '#8CB5A2',
        },
        cream: {
          DEFAULT: '#F2EFE8',
          muted: '#D8D4CA',
        },
        sandstone: {
          DEFAULT: '#96938B',
          light: '#B2AEA7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}

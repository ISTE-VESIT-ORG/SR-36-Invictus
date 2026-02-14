import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'space-black': '#0A0E27',
                'space-blue': '#1E3A8A',
                'cosmic-purple': '#6366F1',
                'star-white': '#F8FAFC',
                'nebula-pink': '#EC4899',
                'galaxy-cyan': '#06B6D4',
                'meteor-orange': '#F59E0B',
                'aurora-green': '#10B981',
                'space-gray': {
                    900: '#0F172A',
                    800: '#1E293B',
                    700: '#334155',
                    500: '#64748B',
                    300: '#CBD5E1',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                glow: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
        },
    },
    plugins: [],
};

export default config;

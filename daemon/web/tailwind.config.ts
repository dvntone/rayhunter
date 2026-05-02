import type { Config } from 'tailwindcss';
import { breakpoints } from './src/theme';

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {
            colors: {
                // Legacy colors (maintained for compatibility)
                'rayhunter-blue': '#4e4eb1',
                'rayhunter-dark-blue': '#3f3da0',
                'rayhunter-green': '#94ea18',

                // Design system colors
                primary: {
                    DEFAULT: '#4e4eb1',
                    dark: '#3f3da0',
                    light: '#6b6bd4',
                },
                success: {
                    DEFAULT: '#48bb78',
                    dark: '#38a169',
                    light: '#68d391',
                },
                warning: {
                    DEFAULT: '#ed8936',
                    dark: '#dd6b20',
                    light: '#f6ad55',
                },
                danger: {
                    DEFAULT: '#f56565',
                    dark: '#e53e3e',
                    light: '#fc8181',
                },
                info: {
                    DEFAULT: '#4299e1',
                    dark: '#3182ce',
                    light: '#63b3ed',
                },
            },
            screens: breakpoints,
            spacing: {
                '18': '4.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            },
        },
    },

    plugins: [],
    darkMode: 'media', // Respect user's system preference
} as Config;

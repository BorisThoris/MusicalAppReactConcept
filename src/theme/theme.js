// Design System Theme Configuration
// Following modern design system best practices with semantic naming

export const theme = {
    // Background Configuration
    background: {
        // Background Images
        // Paths are relative to the src folder when used in GlobalStyles
        images: {
            primary: 'url("./assets/windows-xp-bliss-4k-lu-1920x1080.jpg")',
            website: 'url("./assets/websiteBackground.jpg")'
            // Add more background images as needed
        },
        // Background Properties
        properties: {
            primary: {
                attachment: 'fixed',
                position: 'center',
                repeat: 'no-repeat',
                size: 'cover'
            },
            website: {
                attachment: 'fixed',
                position: 'center',
                repeat: 'no-repeat',
                size: 'cover'
            }
        }
    },

    // Border Radius
    borderRadius: {
        // 12px
        '2xl': '1rem',
        // 16px
        '3xl': '1.5rem', // 2px
        base: '0.25rem', // 24px
        full: '9999px', // 6px
        lg: '0.5rem', // 4px
        md: '0.375rem',
        none: '0',
        sm: '0.125rem', // 8px
        xl: '0.75rem'
    },

    // Breakpoints
    breakpoints: {
        '2xl': '1536px',
        lg: '1024px',
        md: '768px',
        sm: '640px',
        xl: '1280px',
        xs: '0px'
    },

    // Color Palette
    colors: {
        // Accent Colors
        accent: {
            50: '#fef7ee',
            100: '#fdedd4',
            200: '#fbd7a9',
            300: '#f8bb72',
            400: '#f59537',
            500: '#f2750d',
            600: '#e35d08',
            700: '#bc450b',
            800: '#96370f',
            900: '#792f0f',
            950: '#411505'
        },

        // Error Colors
        error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a'
        },

        // Neutral Colors
        neutral: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
            950: '#0a0a0a'
        },

        // Primary Colors
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },

        // Secondary Colors
        secondary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617'
        },

        // Semantic Colors
        semantic: {
            // Background Colors
            background: {
                inverse: '#0f172a',
                overlay: 'rgba(0, 0, 0, 0.5)',
                primary: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9'
            },

            // Border Colors
            border: {
                error: '#ef4444',
                focus: '#3b82f6',
                primary: '#e2e8f0',
                secondary: '#cbd5e1',
                success: '#22c55e',
                tertiary: '#f1f5f9',
                warning: '#f59e0b'
            },

            // Interactive Colors
            interactive: {
                disabled: '#94a3b8',
                error: '#ef4444',
                primary: '#3b82f6',
                secondary: '#64748b',
                success: '#22c55e',
                warning: '#f59e0b'
            },

            // Surface Colors
            surface: {
                elevated: '#ffffff',
                inverse: '#0f172a',
                primary: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9'
            },

            // Text Colors
            text: {
                disabled: '#94a3b8',
                inverse: '#ffffff',
                placeholder: '#94a3b8',
                primary: '#0f172a',
                secondary: '#475569',
                tertiary: '#64748b'
            }
        },

        // Success Colors
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16'
        },

        // Warning Colors
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03'
        }
    },

    // Component-specific tokens
    components: {
        // Button
        button: {
            height: {
                lg: '3rem',
                md: '2.5rem',
                sm: '2rem'
            },
            padding: {
                lg: '1rem 2rem',
                md: '0.75rem 1.5rem',
                sm: '0.5rem 1rem'
            }
        },

        // Card
        card: {
            padding: {
                lg: '2rem',
                md: '1.5rem',
                sm: '1rem'
            }
        },

        // Input
        input: {
            height: {
                lg: '3rem',
                md: '2.5rem',
                sm: '2rem'
            },
            padding: {
                lg: '1rem 1.25rem',
                md: '0.75rem 1rem',
                sm: '0.5rem 0.75rem'
            }
        }
    },

    // Shadows
    shadows: {
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    },

    // Spacing
    spacing: {
        0: '0',
        1: '0.25rem', // 4px
        2: '0.5rem', // 8px
        3: '0.75rem', // 12px
        4: '1rem', // 16px
        5: '1.25rem', // 20px
        6: '1.5rem', // 24px
        8: '2rem', // 32px
        10: '2.5rem', // 40px
        12: '3rem', // 48px
        16: '4rem', // 64px
        20: '5rem', // 80px
        24: '6rem', // 96px
        32: '8rem', // 128px
        40: '10rem', // 160px
        48: '12rem', // 192px
        56: '14rem', // 224px
        64: '16rem' // 256px
    },

    // Transitions
    transitions: {
        duration: {
            base: '250ms',
            fast: '150ms',
            slow: '350ms',
            slower: '500ms'
        },
        easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)'
        }
    },

    // Typography
    typography: {
        // Font Families
        fontFamily: {
            mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
            primary:
                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            secondary:
                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        },

        // Font Sizes
        fontSize: {
            // 20px
            '2xl': '1.5rem', // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem', // 48px
            '6xl': '3.75rem', // 14px
            base: '1rem', // 16px
            lg: '1.125rem', // 12px
            sm: '0.875rem', // 18px
            xl: '1.25rem',
            xs: '0.75rem' // 60px
        },

        // Font Weights
        fontWeight: {
            black: 900,
            bold: 700,
            extrabold: 800,
            extralight: 200,
            light: 300,
            medium: 500,
            normal: 400,
            semibold: 600,
            thin: 100
        },

        // Letter Spacing
        letterSpacing: {
            normal: '0em',
            tight: '-0.025em',
            tighter: '-0.05em',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em'
        },

        // Line Heights
        lineHeight: {
            loose: 2,
            none: 1,
            normal: 1.5,
            relaxed: 1.625,
            snug: 1.375,
            tight: 1.25
        }
    },

    // Z-Index
    zIndex: {
        auto: 'auto',
        banner: 1200,
        base: 0,
        docked: 10,
        dropdown: 1000,
        hide: -1,
        modal: 1400,
        overlay: 1300,
        popover: 1500,
        skipLink: 1600,
        sticky: 1100,
        toast: 1700,
        tooltip: 1800
    }
};

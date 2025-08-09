// Design System Theme Configuration
// Windows 7/Vista Aero Glass inspired theme with accessible contrast

export const theme = {
    // Background Configuration
    background: {
        images: {
            primary: 'url("./assets/windows-xp-bliss-4k-lu-1920x1080.jpg")',
            website: 'url("./assets/websiteBackground.jpg")'
        },
        properties: {
            primary: { attachment: 'fixed', position: 'center', repeat: 'no-repeat', size: 'cover' },
            website: { attachment: 'fixed', position: 'center', repeat: 'no-repeat', size: 'cover' }
        }
    },

    // Border Radius
    borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        base: '0.25rem',
        full: '9999px',
        lg: '0.5rem',
        md: '0.375rem',
        none: '0',
        sm: '0.125rem',
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

    // Color Palette - tuned for accessibility (WCAG-friendly contrasts)
    colors: {
        accent: {
            50: '#edf6ff',
            100: '#d7ebff',
            200: '#a8d4ff',
            300: '#78bbff',
            400: '#4aa3ff',
            500: '#1d8bff',
            600: '#006ed1',
            700: '#0052a3',
            800: '#003875',
            900: '#00224a',
            950: '#00132a'
        },
        error: {
            50: '#fff1f2',
            100: '#ffd9db',
            200: '#ffb3b8',
            300: '#fb8a92',
            400: '#ef5a66',
            500: '#dc3545',
            600: '#b81f30',
            700: '#931824',
            800: '#6d141c',
            900: '#4e0f15',
            950: '#31090d'
        },

        // Glass Morphism (use deep-blue tint but neutral shadows/borders for clarity)
        glass: {
            backdrop: 'rgba(23, 41, 79, 0.12)',
            border: 'rgba(23, 41, 79, 0.28)',
            borderSecondary: 'rgba(23, 41, 79, 0.18)',
            elevated: 'rgba(23, 41, 79, 0.20)',
            inverse: 'rgba(0, 0, 0, 0.22)',
            primary: 'rgba(42, 140, 255, 0.16)',
            secondary: 'rgba(23, 41, 79, 0.10)',
            shadow: 'rgba(2, 6, 23, 0.35)',
            tertiary: 'rgba(23, 41, 79, 0.06)'
        },

        // Neutral (legible on light & glass backgrounds)
        neutral: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1f2937',
            900: '#0b1220',
            950: '#070c15'
        },

        // Primary/Accent Blues (cooler, deeper steps for contrast)
        primary: {
            50: '#eef6ff',
            100: '#d9ecff',
            200: '#b9dbff',
            300: '#8ec5ff',
            400: '#5eaaff',
            500: '#2a8cff', // default brand
            600: '#1a6dd6', // meets contrast with white text
            700: '#1355a6',
            800: '#0e3f79',
            900: '#0a2b52',
            950: '#071b33'
        },
        // Secondary (slate/steel)
        secondary: {
            50: '#f7f8fb',
            100: '#eef1f6',
            200: '#dfe5ee',
            300: '#c6d1e0',
            400: '#93a4bf',
            500: '#6a7a98',
            600: '#4e5a74',
            700: '#39455b',
            800: '#273346',
            900: '#182334',
            950: '#101827'
        },
        // Semantic tokens (bridge UI intent -> surfaces/text)
        semantic: {
            background: {
                inverse: '#0b1220',
                overlay: 'rgba(2, 6, 23, 0.45)',
                primary: 'rgba(255, 255, 255, 0.72)', // frosted light card
                secondary: 'rgba(255, 255, 255, 0.58)',
                tertiary: 'rgba(255, 255, 255, 0.40)'
            },
            border: {
                error: '#dc3545',
                focus: '#2a8cff',
                primary: 'rgba(2, 6, 23, 0.18)',
                secondary: 'rgba(2, 6, 23, 0.12)',
                success: '#16c172',
                tertiary: 'rgba(2, 6, 23, 0.08)',
                warning: '#f2ae1a'
            },
            interactive: {
                disabled: 'rgba(2, 6, 23, 0.32)',
                error: '#dc3545',
                primary: '#2a8cff',
                secondary: '#6a7a98',
                success: '#16c172',
                warning: '#f2ae1a'
            },
            surface: {
                elevated: 'rgba(255, 255, 255, 0.78)',
                inverse: 'rgba(2, 6, 23, 0.75)',
                primary: 'rgba(255, 255, 255, 0.72)',
                secondary: 'rgba(255, 255, 255, 0.58)',
                tertiary: 'rgba(255, 255, 255, 0.40)'
            },
            text: {
                disabled: 'rgba(11, 18, 32, 0.38)',
                inverse: '#ffffff',
                placeholder: 'rgba(11, 18, 32, 0.50)',
                primary: '#0b1220',
                // main dark text
                secondary: 'rgba(11, 18, 32, 0.75)',
                // body/subtle
                tertiary: 'rgba(11, 18, 32, 0.60)'
            }
        },

        // Status palettes (darker mids for text contrast)
        success: {
            50: '#effdf5',
            100: '#d6f7e4',
            200: '#a9eec9',
            300: '#79e3ac',
            400: '#3dd786',
            500: '#16c172',
            600: '#0e9a5c',
            700: '#0b7649',
            800: '#08573a',
            900: '#063e2c',
            950: '#04281e'
        },

        warning: {
            50: '#fff8eb',
            100: '#feefc6',
            200: '#fddf8a',
            300: '#f8c84a',
            400: '#f2ae1a',
            500: '#d98f07',
            600: '#b27105',
            700: '#875404',
            800: '#643f05',
            900: '#4a3006',
            950: '#2c1c03'
        }
    },

    // Component-specific tokens
    components: {
        button: {
            height: { lg: '3rem', md: '2.5rem', sm: '2rem' },
            padding: { lg: '1rem 2rem', md: '0.75rem 1.5rem', sm: '0.5rem 1rem' }
        },
        card: {
            padding: { lg: '2rem', md: '1.5rem', sm: '1rem' }
        },
        input: {
            height: { lg: '3rem', md: '2.5rem', sm: '2rem' },
            padding: { lg: '1rem 1.25rem', md: '0.75rem 1rem', sm: '0.5rem 0.75rem' }
        }
    },

    // Shadows (neutral, readable drop shadows)
    shadows: {
        '2xl': '0 25px 50px -12px rgba(2, 6, 23, 0.35)',
        base: '0 1px 3px 0 rgba(2, 6, 23, 0.10), 0 1px 2px -1px rgba(2, 6, 23, 0.08)',
        glass: '0 8px 32px 0 rgba(2, 6, 23, 0.25)',
        glassLg: '0 16px 64px 0 rgba(2, 6, 23, 0.28)',
        glassXl: '0 24px 96px 0 rgba(2, 6, 23, 0.30)',
        inner: 'inset 0 2px 4px 0 rgba(2, 6, 23, 0.06)',
        lg: '0 10px 15px -3px rgba(2, 6, 23, 0.15), 0 4px 6px -4px rgba(2, 6, 23, 0.12)',
        md: '0 4px 6px -1px rgba(2, 6, 23, 0.14), 0 2px 4px -2px rgba(2, 6, 23, 0.10)',
        none: 'none',
        sm: '0 1px 2px 0 rgba(2, 6, 23, 0.08)',
        xl: '0 20px 25px -5px rgba(2, 6, 23, 0.16), 0 8px 10px -6px rgba(2, 6, 23, 0.12)'
    },

    // Spacing
    spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem',
        40: '10rem',
        48: '12rem',
        56: '14rem',
        64: '16rem'
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
        fontFamily: {
            mono: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', monospace",
            primary:
                "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            secondary:
                "'Segoe UI', 'Inter', -apple-system, BlinkMacSystemFont, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
        },
        fontSize: {
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
            base: '1rem',
            lg: '1.125rem',
            sm: '0.875rem',
            xl: '1.25rem',
            xs: '0.75rem'
        },
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
        letterSpacing: {
            normal: '0em',
            tight: '-0.025em',
            tighter: '-0.05em',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em'
        },
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

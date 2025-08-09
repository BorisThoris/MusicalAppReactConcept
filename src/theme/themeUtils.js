// Theme utility functions for consistent styling and theme access

/**
 * Get a color from the theme with fallback
 * @param {Object} theme - The theme object
 * @param {string} colorPath - The color path (e.g., 'primary.500', 'semantic.text.primary')
 * @param {string} fallback - Fallback color if not found
 * @returns {string} The color value
 */
export const getColor = (theme, colorPath, fallback = '#000000') => {
    if (!theme || !colorPath) return fallback;

    const path = colorPath.split('.');
    let value = theme.colors;

    // eslint-disable-next-line no-restricted-syntax
    for (const key of path) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return fallback;
        }
    }

    return value || fallback;
};

/**
 * Get a spacing value from the theme
 * @param {Object} theme - The theme object
 * @param {string|number} spacing - The spacing key or value
 * @returns {string} The spacing value
 */
export const getSpacing = (theme, spacing) => {
    if (!theme) return '0';

    if (typeof spacing === 'number') {
        return theme.spacing[spacing] || `${spacing}rem`;
    }

    return theme.spacing[spacing] || spacing || '0';
};

/**
 * Get a typography value from the theme
 * @param {Object} theme - The theme object
 * @param {string} type - The typography type (fontSize, fontWeight, lineHeight, etc.)
 * @param {string} value - The specific value key
 * @returns {string|number} The typography value
 */
export const getTypography = (theme, type, value) => {
    if (!theme || !theme.typography || !theme.typography[type]) {
        return type === 'fontWeight' ? 400 : 'inherit';
    }

    return theme.typography[type][value] || theme.typography[type].normal || 'inherit';
};

/**
 * Get a border radius value from the theme
 * @param {Object} theme - The theme object
 * @param {string} radius - The radius key
 * @returns {string} The border radius value
 */
export const getBorderRadius = (theme, radius) => {
    if (!theme) return '0';

    return theme.borderRadius[radius] || radius || '0';
};

/**
 * Get a shadow value from the theme
 * @param {Object} theme - The theme object
 * @param {string} shadow - The shadow key
 * @returns {string} The shadow value
 */
export const getShadow = (theme, shadow) => {
    if (!theme) return 'none';

    return theme.shadows[shadow] || shadow || 'none';
};

/**
 * Get a transition value from the theme
 * @param {Object} theme - The theme object
 * @param {string} type - The transition type (duration, easing)
 * @param {string} value - The specific value key
 * @returns {string} The transition value
 */
export const getTransition = (theme, type, value) => {
    if (!theme || !theme.transitions || !theme.transitions[type]) {
        return type === 'duration' ? '250ms' : 'ease';
    }

    return theme.transitions[type][value] || theme.transitions[type].base || 'inherit';
};

/**
 * Create a responsive breakpoint media query
 * @param {Object} theme - The theme object
 * @param {string} breakpoint - The breakpoint key
 * @returns {string} The media query string
 */
export const getBreakpoint = (theme, breakpoint) => {
    if (!theme || !theme.breakpoints) return '';

    const value = theme.breakpoints[breakpoint];
    return value ? `@media (min-width: ${value})` : '';
};

/**
 * Create a consistent button style object
 * @param {Object} theme - The theme object
 * @param {string} variant - The button variant (primary, secondary, etc.)
 * @param {string} size - The button size (sm, md, lg)
 * @returns {Object} The button style object
 */
export const createButtonStyle = (theme, variant = 'primary', size = 'md') => {
    const baseStyle = {
        '&:disabled': {
            cursor: 'not-allowed',
            opacity: 0.5
        },
        '&:focus': {
            outline: `2px solid ${getColor(theme, 'semantic.border.focus')}`,
            outlineOffset: '2px'
        },
        alignItems: 'center',
        border: 'none',
        borderRadius: getBorderRadius(theme, 'lg'),
        cursor: 'pointer',
        display: 'inline-flex',
        fontWeight: getTypography(theme, 'fontWeight', 'medium'),
        justifyContent: 'center',
        textDecoration: 'none',
        transition: `all ${getTransition(theme, 'duration', 'fast')} ${getTransition(theme, 'easing', 'ease')}`
    };

    // Size variants
    const sizes = {
        lg: {
            fontSize: getTypography(theme, 'fontSize', 'lg'),
            height: theme.components?.button?.height?.lg || '3rem',
            padding: theme.components?.button?.padding?.lg || `${getSpacing(theme, 4)} ${getSpacing(theme, 8)}`
        },
        md: {
            fontSize: getTypography(theme, 'fontSize', 'base'),
            height: theme.components?.button?.height?.md || '2.5rem',
            padding: theme.components?.button?.padding?.md || `${getSpacing(theme, 3)} ${getSpacing(theme, 6)}`
        },
        sm: {
            fontSize: getTypography(theme, 'fontSize', 'sm'),
            height: theme.components?.button?.height?.sm || '2rem',
            padding: theme.components?.button?.padding?.sm || `${getSpacing(theme, 2)} ${getSpacing(theme, 4)}`
        }
    };

    // Color variants
    const variants = {
        error: {
            '&:hover': {
                backgroundColor: getColor(theme, 'error.600')
            },
            backgroundColor: getColor(theme, 'semantic.interactive.error'),
            color: getColor(theme, 'semantic.text.inverse')
        },
        primary: {
            '&:active': {
                backgroundColor: getColor(theme, 'primary.700')
            },
            '&:hover': {
                backgroundColor: getColor(theme, 'primary.600')
            },
            backgroundColor: getColor(theme, 'semantic.interactive.primary'),
            color: getColor(theme, 'semantic.text.inverse')
        },
        secondary: {
            '&:hover': {
                backgroundColor: getColor(theme, 'semantic.surface.tertiary')
            },
            backgroundColor: getColor(theme, 'semantic.surface.secondary'),
            border: `1px solid ${getColor(theme, 'semantic.border.primary')}`,
            color: getColor(theme, 'semantic.text.primary')
        },
        success: {
            '&:hover': {
                backgroundColor: getColor(theme, 'success.600')
            },
            backgroundColor: getColor(theme, 'semantic.interactive.success'),
            color: getColor(theme, 'semantic.text.inverse')
        },
        warning: {
            '&:hover': {
                backgroundColor: getColor(theme, 'warning.600')
            },
            backgroundColor: getColor(theme, 'semantic.interactive.warning'),
            color: getColor(theme, 'semantic.text.inverse')
        }
    };

    return {
        ...baseStyle,
        ...sizes[size],
        ...variants[variant]
    };
};

/**
 * Create a consistent input style object
 * @param {Object} theme - The theme object
 * @param {string} size - The input size (sm, md, lg)
 * @param {boolean} hasError - Whether the input has an error
 * @returns {Object} The input style object
 */
export const createInputStyle = (theme, size = 'md', hasError = false) => {
    const baseStyle = {
        '&::placeholder': {
            color: getColor(theme, 'semantic.text.placeholder')
        },
        '&:disabled': {
            backgroundColor: getColor(theme, 'semantic.surface.secondary'),
            color: getColor(theme, 'semantic.text.disabled'),
            cursor: 'not-allowed'
        },
        '&:focus': {
            borderColor: getColor(theme, 'semantic.border.focus'),
            boxShadow: `0 0 0 3px ${getColor(theme, 'semantic.border.focus')}20`,
            outline: 'none'
        },
        backgroundColor: getColor(theme, 'semantic.surface.primary'),
        border: `1px solid ${
            hasError ? getColor(theme, 'semantic.border.error') : getColor(theme, 'semantic.border.primary')
        }`,
        borderRadius: getBorderRadius(theme, 'base'),
        color: getColor(theme, 'semantic.text.primary'),
        fontFamily: getTypography(theme, 'fontFamily', 'primary'),
        transition: `border-color ${getTransition(theme, 'duration', 'fast')} ${getTransition(
            theme,
            'easing',
            'ease'
        )}`,
        width: '100%'
    };

    const sizes = {
        lg: {
            fontSize: getTypography(theme, 'fontSize', 'lg'),
            height: theme.components?.input?.height?.lg || '3rem',
            padding: theme.components?.input?.padding?.lg || `${getSpacing(theme, 4)} ${getSpacing(theme, 5)}`
        },
        md: {
            fontSize: getTypography(theme, 'fontSize', 'base'),
            height: theme.components?.input?.height?.md || '2.5rem',
            padding: theme.components?.input?.padding?.md || `${getSpacing(theme, 3)} ${getSpacing(theme, 4)}`
        },
        sm: {
            fontSize: getTypography(theme, 'fontSize', 'sm'),
            height: theme.components?.input?.height?.sm || '2rem',
            padding: theme.components?.input?.padding?.sm || `${getSpacing(theme, 2)} ${getSpacing(theme, 3)}`
        }
    };

    return {
        ...baseStyle,
        ...sizes[size]
    };
};

/**
 * Create a consistent card style object
 * @param {Object} theme - The theme object
 * @param {string} size - The card size (sm, md, lg)
 * @returns {Object} The card style object
 */
export const createCardStyle = (theme, size = 'md') => {
    const baseStyle = {
        backgroundColor: getColor(theme, 'semantic.surface.primary'),
        border: `1px solid ${getColor(theme, 'semantic.border.primary')}`,
        borderRadius: getBorderRadius(theme, 'lg'),
        boxShadow: getShadow(theme, 'base')
    };

    const sizes = {
        lg: {
            padding: theme.components?.card?.padding?.lg || getSpacing(theme, 8)
        },
        md: {
            padding: theme.components?.card?.padding?.md || getSpacing(theme, 6)
        },
        sm: {
            padding: theme.components?.card?.padding?.sm || getSpacing(theme, 4)
        }
    };

    return {
        ...baseStyle,
        ...sizes[size]
    };
};

/**
 * Create a consistent typography style object
 * @param {Object} theme - The theme object
 * @param {string} variant - The typography variant (h1, h2, h3, body, caption, etc.)
 * @returns {Object} The typography style object
 */
export const createTypographyStyle = (theme, variant = 'body') => {
    const variants = {
        body: {
            color: getColor(theme, 'semantic.text.secondary'),
            fontSize: getTypography(theme, 'fontSize', 'base'),
            fontWeight: getTypography(theme, 'fontWeight', 'normal'),
            lineHeight: getTypography(theme, 'lineHeight', 'normal')
        },
        caption: {
            color: getColor(theme, 'semantic.text.tertiary'),
            fontSize: getTypography(theme, 'fontSize', 'sm'),
            fontWeight: getTypography(theme, 'fontWeight', 'normal'),
            lineHeight: getTypography(theme, 'lineHeight', 'normal')
        },
        code: {
            backgroundColor: getColor(theme, 'semantic.surface.secondary'),
            borderRadius: getBorderRadius(theme, 'base'),
            color: getColor(theme, 'semantic.text.primary'),
            fontFamily: getTypography(theme, 'fontFamily', 'mono'),
            fontSize: getTypography(theme, 'fontSize', 'sm'),
            fontWeight: getTypography(theme, 'fontWeight', 'normal'),
            lineHeight: getTypography(theme, 'lineHeight', 'normal'),
            padding: `${getSpacing(theme, 1)} ${getSpacing(theme, 2)}`
        },
        h1: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', '4xl'),
            fontWeight: getTypography(theme, 'fontWeight', 'bold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        },
        h2: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', '3xl'),
            fontWeight: getTypography(theme, 'fontWeight', 'semibold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        },
        h3: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', '2xl'),
            fontWeight: getTypography(theme, 'fontWeight', 'semibold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        },
        h4: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', 'xl'),
            fontWeight: getTypography(theme, 'fontWeight', 'semibold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        },
        h5: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', 'lg'),
            fontWeight: getTypography(theme, 'fontWeight', 'semibold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        },
        h6: {
            color: getColor(theme, 'semantic.text.primary'),
            fontSize: getTypography(theme, 'fontSize', 'base'),
            fontWeight: getTypography(theme, 'fontWeight', 'semibold'),
            lineHeight: getTypography(theme, 'lineHeight', 'tight')
        }
    };

    return variants[variant] || variants.body;
};

/**
 * Get a background image from the theme
 * @param {Object} theme - The theme object
 * @param {string} imageKey - The background image key (e.g., 'primary', 'website')
 * @param {string} fallback - Fallback background image if not found
 * @returns {string} The background image URL
 */
export const getBackgroundImage = (theme, imageKey, fallback = 'none') => {
    if (!theme || !theme.background || !theme.background.images) {
        return fallback;
    }

    return theme.background.images[imageKey] || fallback;
};

/**
 * Get background properties from the theme
 * @param {Object} theme - The theme object
 * @param {string} propertyKey - The background property key (e.g., 'primary', 'website')
 * @param {string} property - The specific property (e.g., 'size', 'repeat', 'attachment', 'position')
 * @param {string} fallback - Fallback value if not found
 * @returns {string} The background property value
 */
export const getBackgroundProperty = (theme, propertyKey, property, fallback = 'initial') => {
    if (!theme || !theme.background || !theme.background.properties) {
        return fallback;
    }

    const properties = theme.background.properties[propertyKey];
    if (!properties) {
        return fallback;
    }

    return properties[property] || fallback;
};

/**
 * Create a complete background style object
 * @param {Object} theme - The theme object
 * @param {string} imageKey - The background image key
 * @param {Object} overrides - Optional overrides for background properties
 * @returns {Object} The complete background style object
 */
export const createBackgroundStyle = (theme, imageKey, overrides = {}) => {
    const baseStyle = {
        backgroundAttachment: getBackgroundProperty(theme, imageKey, 'attachment'),
        backgroundImage: getBackgroundImage(theme, imageKey),
        backgroundPosition: getBackgroundProperty(theme, imageKey, 'position'),
        backgroundRepeat: getBackgroundProperty(theme, imageKey, 'repeat'),
        backgroundSize: getBackgroundProperty(theme, imageKey, 'size')
    };

    return {
        ...baseStyle,
        ...overrides
    };
};

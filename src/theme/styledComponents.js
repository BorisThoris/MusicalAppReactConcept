import styled from 'styled-components';
import {
    createBackgroundStyle,
    createButtonStyle,
    createCardStyle,
    createInputStyle,
    createTypographyStyle
} from './themeUtils';

// Background Components
export const BackgroundContainer = styled.div`
    background-image: url('./assets/windows-xp-bliss-4k-lu-1920x1080.jpg');
    background-size: ${({ theme }) => theme.background.properties.primary.size};
    background-repeat: ${({ theme }) => theme.background.properties.primary.repeat};
    background-attachment: ${({ theme }) => theme.background.properties.primary.attachment};
    background-position: ${({ theme }) => theme.background.properties.primary.position};
    width: 100%;
    height: 100%;
    min-height: 100vh;
`;

export const BackgroundOverlay = styled.div`
    background-image: url('./assets/windows-xp-bliss-4k-lu-1920x1080.jpg');
    background-size: ${({ theme }) => theme.background.properties.primary.size};
    background-repeat: ${({ theme }) => theme.background.properties.primary.repeat};
    background-attachment: ${({ theme }) => theme.background.properties.primary.attachment};
    background-position: ${({ theme }) => theme.background.properties.primary.position};
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 100vh;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1;
    }

    & > * {
        position: relative;
        z-index: 2;
    }
`;

// Enhanced Glass Morphism Components
export const GlassContainer = styled.div`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.02) 100%
        );
        pointer-events: none;
        border-radius: inherit;
    }

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        transform: translateY(-2px);
    }
`;

export const GlassElevated = styled(GlassContainer)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    box-shadow: ${({ theme }) => theme.shadows.glassLg};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        transform: translateY(-4px);
    }
`;

export const GlassUltra = styled(GlassContainer)`
    background: ${({ theme }) => theme.colors.glass.tertiary};
    backdrop-filter: blur(30px);
    -webkit-backdrop-filter: blur(30px);
    box-shadow: ${({ theme }) => theme.shadows.glassXl};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        transform: translateY(-6px);
    }
`;

export const GlassInverse = styled(GlassContainer)`
    background: ${({ theme }) => theme.colors.glass.inverse};
    border-color: ${({ theme }) => theme.colors.glass.borderSecondary};

    &:hover {
        border-color: ${({ theme }) => theme.colors.primary[400]};
    }
`;

// Typography Components
export const Heading1 = styled.h1`
    ${({ theme }) => createTypographyStyle(theme, 'h1')}
    margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const Heading2 = styled.h2`
    ${({ theme }) => createTypographyStyle(theme, 'h2')}
    margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

export const Heading3 = styled.h3`
    ${({ theme }) => createTypographyStyle(theme, 'h3')}
    margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const Heading4 = styled.h4`
    ${({ theme }) => createTypographyStyle(theme, 'h4')}
    margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const Heading5 = styled.h5`
    ${({ theme }) => createTypographyStyle(theme, 'h5')}
    margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const Heading6 = styled.h6`
    ${({ theme }) => createTypographyStyle(theme, 'h6')}
    margin-bottom: ${({ theme }) => theme.spacing[1]};
`;

export const BodyText = styled.p`
    ${({ theme }) => createTypographyStyle(theme, 'body')}
    margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const CaptionText = styled.span`
    ${({ theme }) => createTypographyStyle(theme, 'caption')}
`;

export const CodeText = styled.code`
    ${({ theme }) => createTypographyStyle(theme, 'code')}
`;

// Button Components
export const Button = styled.button`
    ${({ size = 'md', theme, variant = 'primary' }) => createButtonStyle(theme, variant, size)}
`;

export const PrimaryButton = styled(Button)`
    ${({ theme }) => createButtonStyle(theme, 'primary', 'md')}
`;

export const SecondaryButton = styled(Button)`
    ${({ theme }) => createButtonStyle(theme, 'secondary', 'md')}
`;

export const SuccessButton = styled(Button)`
    ${({ theme }) => createButtonStyle(theme, 'success', 'md')}
`;

export const WarningButton = styled(Button)`
    ${({ theme }) => createButtonStyle(theme, 'warning', 'md')}
`;

export const ErrorButton = styled(Button)`
    ${({ theme }) => createButtonStyle(theme, 'error', 'md')}
`;

// Glass Morphism Button Variants
export const GlassButton = styled(Button)`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.6s ease;
    }

    &:hover::before {
        left: 100%;
    }

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        transform: translateY(-2px);
    }
`;

export const GlassElevatedButton = styled(GlassButton)`
    background: ${({ theme }) => theme.colors.glass.elevated};
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    box-shadow: ${({ theme }) => theme.shadows.glassLg};

    &:hover {
        background: ${({ theme }) => theme.colors.glass.primary};
        box-shadow: ${({ theme }) => theme.shadows.glassXl};
        transform: translateY(-3px);
    }
`;

// Input Components
export const Input = styled.input`
    ${({ hasError = false, size = 'md', theme }) => createInputStyle(theme, size, hasError)}
`;

export const TextArea = styled.textarea`
    ${({ hasError = false, size = 'md', theme }) => createInputStyle(theme, size, hasError)}
    resize: vertical;
    min-height: ${({ theme }) => theme.components?.input?.height?.md || '2.5rem'};
`;

export const Select = styled.select`
    ${({ hasError = false, size = 'md', theme }) => createInputStyle(theme, size, hasError)}
    cursor: pointer;
`;

// Glass Morphism Input Variants
export const GlassInput = styled(Input)`
    background: ${({ theme }) => theme.colors.glass.secondary};
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:focus {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        outline: none;
    }

    &:hover {
        background: ${({ theme }) => theme.colors.glass.elevated};
        border-color: ${({ theme }) => theme.colors.glass.border};
    }

    &::placeholder {
        color: ${({ theme }) => theme.colors.semantic.text.tertiary};
    }
`;

// Card Components
export const Card = styled.div`
    ${({ size = 'md', theme }) => createCardStyle(theme, size)}
`;

export const CardHeader = styled.div`
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
`;

export const CardBody = styled.div`
    padding: ${({ theme }) => theme.spacing[6]};
`;

export const CardFooter = styled.div`
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
    border-top: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.lg};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.lg};
`;

// Glass Morphism Card Variants
export const GlassCard = styled(Card)`
    background: ${({ theme }) => theme.colors.glass.primary};
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    box-shadow: ${({ theme }) => theme.shadows.glass};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.05) 0%,
            transparent 50%,
            rgba(255, 255, 255, 0.02) 100%
        );
        pointer-events: none;
        border-radius: inherit;
    }

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.glassLg};
        border-color: ${({ theme }) => theme.colors.primary[400]};
        transform: translateY(-4px);
    }
`;

// Layout Components
export const Container = styled.div`
    max-width: ${({ maxWidth = '1200px', theme }) => maxWidth};
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing[4]};

    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
        padding: 0 ${({ theme }) => theme.spacing[6]};
    }
`;

export const Flex = styled.div`
    display: flex;
    align-items: ${({ alignItems = 'stretch' }) => alignItems};
    justify-content: ${({ justifyContent = 'flex-start' }) => justifyContent};
    flex-direction: ${({ direction = 'row' }) => direction};
    gap: ${({ gap = 0, theme }) => theme.spacing[gap] || gap};
    flex-wrap: ${({ wrap = 'nowrap' }) => wrap};
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: ${({ columns = '1fr' }) => columns};
    gap: ${({ gap = 0, theme }) => theme.spacing[gap] || gap};
    align-items: ${({ alignItems = 'stretch' }) => alignItems};
    justify-items: ${({ justifyItems = 'stretch' }) => justifyItems};
`;

export const Box = styled.div`
    padding: ${({ padding = 0, theme }) => theme.spacing[padding] || padding};
    margin: ${({ margin = 0, theme }) => theme.spacing[margin] || margin};
    background-color: ${({ bg, theme }) => (bg ? theme.colors.semantic.background[bg] || bg : 'transparent')};
    border-radius: ${({ borderRadius = 'none', theme }) => theme.borderRadius[borderRadius] || borderRadius};
    border: ${({ border, theme }) => (border ? `1px solid ${theme.colors.semantic.border[border] || border}` : 'none')};
    box-shadow: ${({ shadow = 'none', theme }) => theme.shadows[shadow] || shadow};
`;

// Navigation Components
export const Nav = styled.nav`
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    padding: ${({ theme }) => theme.spacing[4]} 0;
    box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const NavContainer = styled(Container)`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const NavList = styled.ul`
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: ${({ theme }) => theme.spacing[4]};
`;

export const NavItem = styled.li`
    margin: 0;
`;

export const NavLink = styled.a`
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    transition: all ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
        color: ${({ theme }) => theme.colors.semantic.text.primary};
        background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    }

    &.active {
        color: ${({ theme }) => theme.colors.semantic.interactive.primary};
        background-color: ${({ theme }) => theme.colors.primary[50]};
    }
`;

// Form Components
export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[4]};
`;

export const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[1]};
`;

export const Label = styled.label`
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

export const FormError = styled.span`
    color: ${({ theme }) => theme.colors.semantic.interactive.error};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-top: ${({ theme }) => theme.spacing[1]};
`;

export const FormHelp = styled.span`
    color: ${({ theme }) => theme.colors.semantic.text.tertiary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin-top: ${({ theme }) => theme.spacing[1]};
`;

// Modal Components
export const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ theme }) => theme.colors.semantic.background.overlay};
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${({ theme }) => theme.zIndex.modal};
    padding: ${({ theme }) => theme.spacing[4]};
`;

export const ModalContent = styled.div`
    background-color: ${({ theme }) => theme.colors.semantic.surface.primary};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    box-shadow: ${({ theme }) => theme.shadows['2xl']};
    max-width: ${({ maxWidth = '500px' }) => maxWidth};
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
`;

export const ModalHeader = styled.div`
    padding: ${({ theme }) => theme.spacing[6]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

export const ModalBody = styled.div`
    padding: ${({ theme }) => theme.spacing[6]};
`;

export const ModalFooter = styled.div`
    padding: ${({ theme }) => theme.spacing[6]};
    border-top: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
    display: flex;
    gap: ${({ theme }) => theme.spacing[3]};
    justify-content: flex-end;
`;

// Badge Components
export const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    background-color: ${({ theme, variant = 'primary' }) => {
        switch (variant) {
            case 'success':
                return theme.colors.success[100];
            case 'warning':
                return theme.colors.warning[100];
            case 'error':
                return theme.colors.error[100];
            default:
                return theme.colors.primary[100];
        }
    }};
    color: ${({ theme, variant = 'primary' }) => {
        switch (variant) {
            case 'success':
                return theme.colors.success[700];
            case 'warning':
                return theme.colors.warning[700];
            case 'error':
                return theme.colors.error[700];
            default:
                return theme.colors.primary[700];
        }
    }};
`;

// Divider Component
export const Divider = styled.hr`
    border: none;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.semantic.border.primary};
    margin: ${({ theme }) => theme.spacing[4]} 0;
`;

// Spinner Component
export const Spinner = styled.div`
    width: ${({ size = '24px' }) => size};
    height: ${({ size = '24px' }) => size};
    border: 2px solid ${({ theme }) => theme.colors.semantic.border.primary};
    border-top: 2px solid ${({ theme }) => theme.colors.semantic.interactive.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

// Tooltip Component
export const Tooltip = styled.div`
    position: relative;
    display: inline-block;

    &:hover::after {
        content: '${({ text }) => text}';
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${({ theme }) => theme.colors.semantic.surface.inverse};
        color: ${({ theme }) => theme.colors.semantic.text.inverse};
        padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
        border-radius: ${({ theme }) => theme.borderRadius.base};
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        white-space: nowrap;
        z-index: ${({ theme }) => theme.zIndex.tooltip};
        box-shadow: ${({ theme }) => theme.shadows.md};
    }
`;

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    background: ${({ theme }) => theme.colors.semantic.background.primary};
    background-image: ${({ theme }) => theme.background.images.primary};
    background-attachment: ${({ theme }) => theme.background.properties.primary.attachment};
    background-position: ${({ theme }) => theme.background.properties.primary.position};
    background-repeat: ${({ theme }) => theme.background.properties.primary.repeat};
    background-size: ${({ theme }) => theme.background.properties.primary.size};
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Aero Glass Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.glass.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.glass.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    backdrop-filter: blur(10px);
    transition: all ${({ theme }) => theme.transitions.duration.base} ${({ theme }) => theme.transitions.easing.ease};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.glass.elevated};
    border-color: ${({ theme }) => theme.colors.glass.border};
  }

  ::-webkit-scrollbar-corner {
    background: ${({ theme }) => theme.colors.glass.tertiary};
  }

  /* Selection Styling - Aero Blue */
  ::selection {
    background: ${({ theme }) => theme.colors.accent[500]};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
  }

  ::-moz-selection {
    background: ${({ theme }) => theme.colors.accent[500]};
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
  }

  /* Focus Styling - Aero Blue */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent[500]};
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize['5xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  p {
    margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
  }

  a {
    color: ${({ theme }) => theme.colors.accent[500]};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.duration.base} ${({ theme }) => theme.transitions.easing.ease};
  }

  a:hover {
    color: ${({ theme }) => theme.colors.accent[400]};
  }

  /* Form Elements - Aero Style */
  input, textarea, select, button {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  input, textarea, select {
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    backdrop-filter: blur(10px);
    transition: all ${({ theme }) => theme.transitions.duration.base} ${({ theme }) => theme.transitions.easing.ease};
  }

  input:focus, textarea:focus, select:focus {
    border-color: ${({ theme }) => theme.colors.accent[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.glass.shadow};
    outline: none;
  }

  input::placeholder, textarea::placeholder {
    color: ${({ theme }) => theme.colors.semantic.text.placeholder};
  }

  /* Button Base Styles - Aero Glass */
  button {
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    backdrop-filter: blur(10px);
    transition: all ${({ theme }) => theme.transitions.duration.base} ${({ theme }) => theme.transitions.easing.ease};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }

  button:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.glass.elevated};
    border-color: ${({ theme }) => theme.colors.glass.border};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.glass.tertiary};
  }

  /* List Styling */
  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
  }

  /* Table Styling - Aero Glass */
  table {
    border-collapse: collapse;
    width: 100%;
    background: ${({ theme }) => theme.colors.glass.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    backdrop-filter: blur(10px);
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
  }

  th, td {
    padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
  }

  th {
    background: ${({ theme }) => theme.colors.glass.secondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
  }

  tr:hover {
    background: ${({ theme }) => theme.colors.glass.tertiary};
  }

  /* Code Styling - Aero Theme */
  code {
    background: ${({ theme }) => theme.colors.glass.secondary};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    color: ${({ theme }) => theme.colors.accent[500]};
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
  }

  pre {
    background: ${({ theme }) => theme.colors.glass.secondary};
    border: 1px solid ${({ theme }) => theme.colors.glass.borderSecondary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
    overflow-x: auto;
    padding: ${({ theme }) => theme.spacing[4]};
    backdrop-filter: blur(10px);
  }

  /* Image Styling */
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }

  /* Utility Classes for Aero Glass Effects */
  .aero-glass {
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    backdrop-filter: blur(10px);
    box-shadow: ${({ theme }) => theme.shadows.glass};
  }

  .aero-glass-elevated {
    background: ${({ theme }) => theme.colors.glass.elevated};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    backdrop-filter: blur(15px);
    box-shadow: ${({ theme }) => theme.shadows.glassLg};
  }

  .aero-glass-strong {
    background: ${({ theme }) => theme.colors.glass.primary};
    border: 1px solid ${({ theme }) => theme.colors.glass.border};
    backdrop-filter: blur(20px);
    box-shadow: ${({ theme }) => theme.shadows.glassXl};
  }

  /* Animation Keyframes for Aero Effects */
  @keyframes aero-glow {
    0% {
      box-shadow: 0 0 5px ${({ theme }) => theme.colors.accent[500]}40;
    }
    50% {
      box-shadow: 0 0 20px ${({ theme }) => theme.colors.accent[500]}80;
    }
    100% {
      box-shadow: 0 0 5px ${({ theme }) => theme.colors.accent[500]}40;
    }
  }

  @keyframes aero-fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive Design */
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    body {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }

    h1 {
      font-size: ${({ theme }) => theme.typography.fontSize['4xl']};
    }

    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }

    h3 {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    body {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
    }

    h1 {
      font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
    }

    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    }

    h3 {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
    }
  }

  /* Print Styles */
  @media print {
    body {
      background: white;
      color: black;
    }

    .aero-glass,
    .aero-glass-elevated,
    .aero-glass-strong {
      background: white;
      border: 1px solid #ccc;
      box-shadow: none;
      backdrop-filter: none;
    }
  }
`;

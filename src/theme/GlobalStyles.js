import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Reset and base styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
    background-color: ${({ theme }) => theme.colors.semantic.background.primary};
    /* background-image: ${({ theme }) => theme.background.images.primary}; */
    background-size: ${({ theme }) => theme.background.properties.primary.size};
    background-repeat: ${({ theme }) => theme.background.properties.primary.repeat};
    background-attachment: ${({ theme }) => theme.background.properties.primary.attachment};
    background-position: ${({ theme }) => theme.background.properties.primary.position};
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
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

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
  }

  p {
    margin: 0 0 ${({ theme }) => theme.spacing[4]} 0;
    color: ${({ theme }) => theme.colors.semantic.text.secondary};
  }

  /* Links */
  a {
    color: ${({ theme }) => theme.colors.semantic.interactive.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.duration.fast} ${({ theme }) => theme.transitions.easing.ease};

    &:hover {
      color: ${({ theme }) => theme.colors.primary[600]};
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.semantic.border.focus};
      outline-offset: 2px;
    }
  }

  /* Lists */
  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Form elements */
  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  button,
  input {
    overflow: visible;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  [type="button"],
  [type="reset"],
  [type="submit"] {
    -webkit-appearance: button;
  }

  /* Remove default button styles */
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
  }

  /* Focus styles */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.semantic.border.focus};
    outline-offset: 2px;
  }

  /* Remove focus outline for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Code */
  code {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[2]};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
  }

  pre {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    background-color: ${({ theme }) => theme.colors.semantic.surface.secondary};
    padding: ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    overflow-x: auto;
    margin: ${({ theme }) => theme.spacing[4]} 0;
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Tables */
  table {
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
  }

  th,
  td {
    text-align: left;
    padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
    border-bottom: 1px solid ${({ theme }) => theme.colors.semantic.border.primary};
  }

  th {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.semantic.surface.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.semantic.border.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.semantic.border.primary};
  }

  /* Selection */
  ::selection {
    background-color: ${({ theme }) => theme.colors.primary[200]};
    color: ${({ theme }) => theme.colors.semantic.text.primary};
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Print styles */
  @media print {
    *,
    *::before,
    *::after {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }

    a,
    a:visited {
      text-decoration: underline;
    }

    a[href]:after {
      content: " (" attr(href) ")";
    }

    abbr[title]:after {
      content: " (" attr(title) ")";
    }

    a[href^="#"]:after,
    a[href^="javascript:"]:after {
      content: "";
    }

    pre,
    blockquote {
      border: 1px solid #999;
      page-break-inside: avoid;
    }

    thead {
      display: table-header-group;
    }

    tr,
    img {
      page-break-inside: avoid;
    }

    img {
      max-width: 100% !important;
    }

    p,
    h2,
    h3 {
      orphans: 3;
      widows: 3;
    }

    h2,
    h3 {
      page-break-after: avoid;
    }
  }
`;

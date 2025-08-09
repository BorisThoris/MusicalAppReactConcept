# Theme System Documentation

## Overview

This theme system follows modern design system best practices used by companies like Material-UI, Ant Design, and Chakra UI. It provides a comprehensive, scalable, and maintainable approach to styling React applications.

## 🎨 Design Tokens

### Colors

The color system is organized into semantic and functional categories:

#### Primary Colors
```javascript
theme.colors.primary[50]   // Lightest shade
theme.colors.primary[500]  // Base color
theme.colors.primary[950]  // Darkest shade
```

#### Semantic Colors
```javascript
// Background colors
theme.colors.semantic.background.primary    // Main background
theme.colors.semantic.background.secondary  // Secondary background
theme.colors.semantic.background.tertiary   // Tertiary background

// Text colors
theme.colors.semantic.text.primary          // Primary text
theme.colors.semantic.text.secondary        // Secondary text
theme.colors.semantic.text.tertiary         // Tertiary text

// Interactive colors
theme.colors.semantic.interactive.primary   // Primary actions
theme.colors.semantic.interactive.success   // Success states
theme.colors.semantic.interactive.warning   // Warning states
theme.colors.semantic.interactive.error     // Error states
```

### Typography

#### Font Families
```javascript
theme.typography.fontFamily.primary  // Main font family
theme.typography.fontFamily.secondary // Secondary font family
theme.typography.fontFamily.mono     // Monospace font family
```

#### Font Sizes
```javascript
theme.typography.fontSize.xs     // 12px
theme.typography.fontSize.sm     // 14px
theme.typography.fontSize.base   // 16px
theme.typography.fontSize.lg     // 18px
theme.typography.fontSize.xl     // 20px
theme.typography.fontSize['2xl'] // 24px
```

#### Font Weights
```javascript
theme.typography.fontWeight.normal    // 400
theme.typography.fontWeight.medium    // 500
theme.typography.fontWeight.semibold  // 600
theme.typography.fontWeight.bold      // 700
```

### Spacing

Consistent spacing scale:
```javascript
theme.spacing[0]   // 0
theme.spacing[1]   // 4px
theme.spacing[2]   // 8px
theme.spacing[4]   // 16px
theme.spacing[6]   // 24px
theme.spacing[8]   // 32px
```

### Border Radius

```javascript
theme.borderRadius.none  // 0
theme.borderRadius.sm    // 2px
theme.borderRadius.base  // 4px
theme.borderRadius.lg    // 8px
theme.borderRadius.xl    // 12px
theme.borderRadius.full  // 9999px
```

### Shadows

```javascript
theme.shadows.sm    // Small shadow
theme.shadows.base  // Base shadow
theme.shadows.md    // Medium shadow
theme.shadows.lg    // Large shadow
theme.shadows.xl    // Extra large shadow
```

### Backgrounds

The theme includes a comprehensive background configuration system:

#### Background Images
```javascript
// Available background images
theme.background.images.primary  // Windows XP Bliss background
theme.background.images.website  // Website background
```

#### Background Properties
```javascript
// Background properties for each image
theme.background.properties.primary.size        // 'cover'
theme.background.properties.primary.repeat      // 'no-repeat'
theme.background.properties.primary.attachment  // 'fixed'
theme.background.properties.primary.position    // 'center'
```

#### Using Backgrounds in Components
```javascript
// Using the background in styled components
const StyledContainer = styled.div`
  background-image: ${({ theme }) => theme.background.images.primary};
  background-size: ${({ theme }) => theme.background.properties.primary.size};
  background-repeat: ${({ theme }) => theme.background.properties.primary.repeat};
  background-attachment: ${({ theme }) => theme.background.properties.primary.attachment};
  background-position: ${({ theme }) => theme.background.properties.primary.position};
`;

// Using pre-built background components
import { BackgroundContainer, BackgroundOverlay } from './theme/styledComponents';

<BackgroundContainer>
  <h1>Content with background</h1>
</BackgroundContainer>

<BackgroundOverlay>
  <h1>Content with background and overlay</h1>
</BackgroundOverlay>
```

## 🎯 Usage

### Basic Setup

```jsx
import { ThemeProvider, GlobalStyles, theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### Using Theme in Styled Components

```jsx
import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
  color: ${({ theme }) => theme.colors.semantic.text.inverse};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary[600]};
  }
`;
```

### Using Theme Utilities

```jsx
import { getColor, getSpacing, createButtonStyle } from './theme/themeUtils';

// Get color with fallback
const color = getColor(theme, 'semantic.text.primary', '#000000');

// Get spacing value
const padding = getSpacing(theme, 4); // Returns '1rem'

// Create button styles
const buttonStyles = createButtonStyle(theme, 'primary', 'md');
```

### Using Pre-built Components

```jsx
import { 
  Button, 
  PrimaryButton, 
  Card, 
  Heading1, 
  BodyText 
} from './theme/styledComponents';

function MyComponent() {
  return (
    <Card>
      <Heading1>Welcome</Heading1>
      <BodyText>This is a sample component.</BodyText>
      <PrimaryButton>Click me</PrimaryButton>
    </Card>
  );
}
```

## 🏗️ Component Architecture

### Styled Components

The theme system provides pre-built styled components:

#### Typography Components
- `Heading1` - `Heading6` - Semantic heading components
- `BodyText` - Body text component
- `CaptionText` - Caption text component
- `CodeText` - Code text component

#### Button Components
- `Button` - Base button with variants
- `PrimaryButton` - Primary action button
- `SecondaryButton` - Secondary action button
- `SuccessButton` - Success action button
- `WarningButton` - Warning action button
- `ErrorButton` - Error action button

#### Form Components
- `Input` - Text input component
- `TextArea` - Textarea component
- `Select` - Select component
- `Label` - Form label component
- `FormError` - Form error component
- `FormHelp` - Form help text component

#### Layout Components
- `Container` - Responsive container
- `Flex` - Flexbox container
- `Grid` - CSS Grid container
- `Box` - Utility box component

#### Card Components
- `Card` - Base card component
- `CardHeader` - Card header component
- `CardBody` - Card body component
- `CardFooter` - Card footer component

#### Navigation Components
- `Nav` - Navigation container
- `NavContainer` - Navigation content container
- `NavList` - Navigation list
- `NavItem` - Navigation item
- `NavLink` - Navigation link

#### Modal Components
- `ModalOverlay` - Modal overlay
- `ModalContent` - Modal content
- `ModalHeader` - Modal header
- `ModalBody` - Modal body
- `ModalFooter` - Modal footer

## 🎨 Customization

### Extending the Theme

```jsx
import { theme } from './theme';

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    custom: {
      brand: '#ff6b6b',
      accent: '#4ecdc4'
    }
  }
};
```

### Creating Custom Components

```jsx
import styled from 'styled-components';
import { createButtonStyle } from './themeUtils';

const CustomButton = styled.button`
  ${({ theme, variant = 'primary', size = 'md' }) => 
    createButtonStyle(theme, variant, size)}
  
  // Custom styles
  border: 2px solid ${({ theme }) => theme.colors.custom.brand};
`;
```

## 🔧 Best Practices

### 1. Use Semantic Colors
Always use semantic colors instead of hardcoded values:
```jsx
// ✅ Good
color: ${({ theme }) => theme.colors.semantic.text.primary};

// ❌ Bad
color: #000000;
```

### 2. Use Spacing Scale
Use the spacing scale for consistent spacing:
```jsx
// ✅ Good
padding: ${({ theme }) => theme.spacing[4]};

// ❌ Bad
padding: 16px;
```

### 3. Use Typography Scale
Use the typography scale for consistent text sizing:
```jsx
// ✅ Good
font-size: ${({ theme }) => theme.typography.fontSize.lg};

// ❌ Bad
font-size: 18px;
```

### 4. Use Pre-built Components
Use pre-built components when possible:
```jsx
// ✅ Good
import { Button, Card } from './theme/styledComponents';

// ❌ Bad
const CustomButton = styled.button`...`;
```

### 5. Use Theme Utilities
Use theme utilities for complex styling:
```jsx
// ✅ Good
import { createButtonStyle } from './themeUtils';

const StyledButton = styled.button`
  ${({ theme, variant, size }) => createButtonStyle(theme, variant, size)}
`;
```

## 🎯 Migration Guide

### From Hardcoded Styles

1. **Replace hardcoded colors:**
```jsx
// Before
background-color: yellow;

// After
background-color: ${({ theme }) => theme.colors.semantic.background.primary};
```

2. **Replace hardcoded spacing:**
```jsx
// Before
padding: 16px;

// After
padding: ${({ theme }) => theme.spacing[4]};
```

3. **Replace hardcoded typography:**
```jsx
// Before
font-size: 18px;

// After
font-size: ${({ theme }) => theme.typography.fontSize.lg};
```

### From CSS Files

1. **Convert CSS classes to styled components:**
```jsx
// Before
<div className="button primary">Click me</div>

// After
import { PrimaryButton } from './theme/styledComponents';

<PrimaryButton>Click me</PrimaryButton>
```

## 🚀 Performance

### Optimization Tips

1. **Memoize theme-dependent components:**
```jsx
const StyledComponent = React.memo(styled.div`
  color: ${({ theme }) => theme.colors.semantic.text.primary};
`);
```

2. **Use theme utilities for complex calculations:**
```jsx
const buttonStyles = useMemo(() => 
  createButtonStyle(theme, variant, size), 
  [theme, variant, size]
);
```

3. **Avoid inline styles:**
```jsx
// ✅ Good
const StyledComponent = styled.div`
  color: ${({ theme }) => theme.colors.semantic.text.primary};
`;

// ❌ Bad
<div style={{ color: theme.colors.semantic.text.primary }}>
```

## 📚 Resources

- [Styled Components Documentation](https://styled-components.com/docs)
- [Design System Best Practices](https://www.designsystems.digital/)
- [Material Design Guidelines](https://material.io/design)
- [Ant Design Guidelines](https://ant.design/docs/spec/introduce)

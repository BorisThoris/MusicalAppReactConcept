# Musical App React Concept - Project Cache

## 🎯 **Project Overview**
A React-based musical application with FMOD integration for audio processing, featuring multiple instruments (Guitar, Piano, Drums, Tambourine) and a sophisticated timeline editor.

## 📁 **Project Structure**

### **Core Directories**
```
src/
├── components/           # React components
│   ├── Drums/           # Drum instrument components
│   ├── Editor/          # Main editor interface
│   ├── Guitar/          # Guitar instrument components
│   ├── Piano/           # Piano instrument components
│   └── Tambourine/      # Tambourine instrument components
├── providers/           # React Context providers
├── hooks/               # Custom React hooks
├── constants/           # Application constants
├── utils/               # Utility functions
├── globalHelpers/       # Global helper functions
├── globalConstants/     # Global constants
├── fmodLogic/          # FMOD audio integration
└── theme/              # Theme system (NEW)
    ├── index.js        # Theme exports
    ├── theme.js        # Theme configuration
    ├── GlobalStyles.js # Global styles
    ├── themeUtils.js   # Theme utilities
    ├── styledComponents.js # Pre-built components
    └── README.md       # Theme documentation
```

## 🎵 **Key Components**

### **Main App Structure**
- **App.js**: Main application component with routing and provider hierarchy
- **Editor.js**: Main editor interface with timeline and panels
- **Instruments**: Guitar, Piano, Drums, Tambourine components

### **Editor Components**
- **Timelines**: Timeline visualization and management
- **Panels**: Various UI panels (Instruments, Selections, Load, Save)
- **ActionsMenu**: Context menu for actions
- **FPSMonitor**: Performance monitoring

## 🎨 **Theme System** (NEW)

### **Theme Architecture**
The project now includes a comprehensive theme system following modern design system best practices:

#### **Design Tokens**
- **Colors**: Semantic color system with primary, secondary, accent, success, warning, error, and neutral palettes
- **Typography**: Font families, sizes, weights, line heights, and letter spacing
- **Spacing**: Consistent spacing scale (4px base unit)
- **Border Radius**: Standardized border radius values
- **Shadows**: Elevation and depth system
- **Transitions**: Duration and easing functions
- **Z-Index**: Layering system
- **Breakpoints**: Responsive design breakpoints

#### **Theme Structure**
```javascript
theme = {
  colors: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 950: '#172554' },
    semantic: {
      background: { primary: '#ffffff', secondary: '#f8fafc' },
      text: { primary: '#0f172a', secondary: '#475569' },
      interactive: { primary: '#3b82f6', success: '#22c55e' }
    }
  },
  typography: {
    fontFamily: { primary: 'Inter, sans-serif' },
    fontSize: { base: '1rem', lg: '1.125rem' },
    fontWeight: { normal: 400, medium: 500, bold: 700 }
  },
  spacing: { 0: '0', 1: '0.25rem', 4: '1rem' },
  borderRadius: { base: '0.25rem', lg: '0.5rem' },
  shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }
}
```

#### **Pre-built Components**
- **Typography**: `Heading1`-`Heading6`, `BodyText`, `CaptionText`, `CodeText`
- **Buttons**: `Button`, `PrimaryButton`, `SecondaryButton`, `SuccessButton`, `WarningButton`, `ErrorButton`
- **Forms**: `Input`, `TextArea`, `Select`, `Label`, `FormError`, `FormHelp`
- **Layout**: `Container`, `Flex`, `Grid`, `Box`
- **Cards**: `Card`, `CardHeader`, `CardBody`, `CardFooter`
- **Navigation**: `Nav`, `NavContainer`, `NavList`, `NavItem`, `NavLink`
- **Modals**: `ModalOverlay`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`

#### **Theme Utilities**
- `getColor()` - Get color with fallback
- `getSpacing()` - Get spacing value
- `getTypography()` - Get typography value
- `createButtonStyle()` - Create button styles
- `createInputStyle()` - Create input styles
- `createCardStyle()` - Create card styles

### **Usage Examples**
```jsx
// Using theme in styled components
const StyledButton = styled.button`
  background-color: ${({ theme }) => theme.colors.semantic.interactive.primary};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

// Using pre-built components
import { PrimaryButton, Card, Heading1 } from './theme/styledComponents';

<Card>
  <Heading1>Welcome</Heading1>
  <PrimaryButton>Click me</PrimaryButton>
</Card>
```

## 🔄 **Provider Hierarchy**

### **Optimized Provider Structure**
```jsx
<ThemeProvider theme={theme}>           // Theme system (NEW)
  <GlobalStyles />                      // Global styles (NEW)
  <NotificationProvider>                // Global notifications (stable)
    <PixelRatioProvider>                // Screen dimensions (stable)
      <PanelProvider>                   // UI panels (moderate)
        <CustomCursorProvider>          // Cursor state (frequent)
          <TimelineProvider>            // Timeline dimensions (stable)
            <RecordingsPlayerProvider>  // Playback state (moderate)
              <EditorStateProvider>     // Combined editor state
                <CollisionsProvider>    // Core collisions (optimized)
                  <PaintingProvider>    // Painting functionality
                    <SelectionProvider> // Selection state (optimized)
                      <SoundEventDragProvider> // Drag and drop (optimized)
                        {children}
                      </SoundEventDragProvider>
                    </SelectionProvider>
                  </PaintingProvider>
                </CollisionsProvider>
              </EditorStateProvider>
            </RecordingsPlayerProvider>
          </TimelineProvider>
        </CustomCursorProvider>
      </PanelProvider>
    </PixelRatioProvider>
  </NotificationProvider>
</ThemeProvider>
```

## 🎯 **Key Providers**

### **TimelineProvider** (`src/providers/TimelineProvider.js`)
- **Purpose**: Manages timeline dimensions and calculations
- **Key exports**: `TimelineHeight`, `markersHeight`, `Y_OFFSET`, `markersAndTrackerOffset`
- **Constants**: Located in `src/constants/timeline.js`

### **CollisionsProvider** (`src/providers/CollisionsProvider/`)
- **Purpose**: Handles beat collisions, overlaps, and timeline references
- **Structure**: Split into focused providers (BeatProvider, TimelineRefsProvider, OverlapProvider, HistoryProvider)

### **EditorStateProvider** (`src/providers/EditorStateProvider.js`)
- **Purpose**: Combined editor state management
- **Integration**: Combines related editor functionality

## 📊 **Data Structures**

### **OverlapGroups** (`overlapGroups`)
```javascript
// Structure: { [instrumentName]: { [groupId]: OverlapGroup } }
const overlapGroups = {
  "Drum": {
    "group-1": {
      id: "group-1",
      instrumentName: "Drum",
      startTime: 0.5,
      endTime: 2.0,
      eventLength: 1.5,
      isSelected: false,
      locked: false,
      elements: {
        "recording-1": {
          id: "recording-1",
          instrumentName: "Drum",
          startTime: 0.5,
          endTime: 1.2,
          eventLength: 0.7,
          name: "Snare",
          eventInstance: FMODEventInstance,
          eventPath: "Drum/Snare",
          params: [],
          isSelected: false,
          locked: false,
          element: KonvaElement,
          rect: { x: 100, y: 50, width: 200, height: 100 }
        },
        "recording-2": {
          // ... similar structure
        }
      },
      element: KonvaElement, // Parent group element
      rect: { x: 100, y: 50, width: 300, height: 100 },
      ids: ["recording-1", "recording-2"]
    }
  }
};
```

### **Beat** (`beat`)
```javascript
// Structure: Beat object
const beat = {
  name: "My Beat",
  date: "2024-01-15T10:30:00",
  data: overlapGroups // Full overlapGroups structure
};
```

### **Sound Event Recording** (`recording`)
```javascript
// Structure: Individual sound event
const recording = {
  id: "recording-1",
  instrumentName: "Drum",
  startTime: 0.5,
  endTime: 1.2,
  eventLength: 0.7,
  name: "Snare",
  eventInstance: FMODEventInstance,
  eventPath: "Drum/Snare",
  params: [
    {
      name: "volume",
      value: 0.8,
      type: "float"
    }
  ],
  isSelected: false,
  locked: false,
  parentId: "group-1", // If part of overlap group
  element: KonvaElement, // Konva element reference
  rect: { x: 100, y: 50, width: 200, height: 100 }
};
```

### **Processed Elements** (`processedItems`)
```javascript
// Structure: Array of processed elements
const processedItems = [
  {
    element: KonvaElement,
    height: 100,
    width: 200,
    x: 100,
    y: 50,
    instrumentName: "Drum",
    recording: recording, // Full recording object
    rect: { x: 100, y: 50, width: 200, height: 100 },
    timelineY: 0
  }
];
```

### **Timeline Refs** (`timelineRefs`)
```javascript
// Structure: Timeline references
const timelineRefs = {
  "Drum": {
    timeline: KonvaStage,
    elements: [KonvaElement],
    y: 100
  },
  "Piano": {
    timeline: KonvaStage,
    elements: [KonvaElement],
    y: 200
  }
};
```

### **Beat Properties** (FMOD Integration)
```javascript
// Structure: FMOD beat properties
const beatProperties = {
  bar: 1,
  beat: 1,
  position: 0, // Position in milliseconds
  tempo: 120.0, // BPM
  timesignatureupper: 4, // Beats per bar
  timesignaturelower: 4  // Beat unit
};
```

## 🎼 **Audio Integration**

### **FMOD Integration**
- **Location**: `src/fmodLogic/`
- **Initialization**: `src/fmodLogic/index.js`
- **Event Helpers**: `src/fmodLogic/eventInstanceHelpers.js`

### **Audio Assets**
- **Location**: `public/FmodProject/Assets/`
- **Instruments**: Piano, Drum, Guitar samples
- **Formats**: .wav, .mp3, .aiff

## 🎨 **UI/UX Components**

### **Styled Components**
- **Framework**: styled-components v6.0.8
- **Usage**: Consistent styling across components
- **Theme Integration**: Full theme system integration

### **Konva Integration**
- **Purpose**: Canvas-based graphics and interactions
- **Usage**: Timeline visualization, drag and drop

## 🔧 **Key Hooks**

### **Custom Hooks**
- **useBeatManager**: Beat management logic
- **useOverlapManager**: Overlap calculation
- **usePainting**: Painting functionality
- **usePanelState**: Panel management
- **usePixelToSecondRatio**: Screen ratio calculations

## 📊 **Performance Optimizations**

### **Implemented Optimizations**
1. **Provider Breakdown**: Split large providers into focused ones
2. **Helper Extraction**: Moved utilities to separate files
3. **Constants Organization**: Centralized constants
4. **Memoization**: Optimized re-renders with useMemo/useCallback
5. **Context Hierarchy**: Organized providers by change frequency
6. **Theme System**: Consistent design tokens and styling

### **Key Performance Files**
- **dragHelpers.js**: Extracted drag utilities
- **timeline.js**: Timeline constants
- **usePainting.js**: Painting hook extraction
- **theme/**: Complete theme system

## 🎯 **Development Tools**

### **Scripts**
```json
{
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "lint": "eslint src/**/*.{js,jsx,ts,tsx,json}",
  "lint:fix": "eslint --fix src/**/*.{js,jsx,ts,tsx,json}",
  "format": "prettier --write src/**/*.{js,jsx,ts,tsx,css,md,json,scss}"
}
```

### **Dependencies**
- **React**: 18.2.0
- **React Router**: 6.16.0
- **Styled Components**: 6.0.8
- **Konva**: 9.2.2
- **FMOD**: Custom integration

## 🔍 **Common Issues & Solutions**

### **Export Errors**
- **Issue**: Constants moved to separate files
- **Solution**: Re-exports in TimelineProvider for backward compatibility

### **Context Access**
- **Issue**: Provider structure changes
- **Solution**: Updated context access patterns

### **Performance**
- **Issue**: Large providers causing re-renders
- **Solution**: Provider breakdown and memoization

### **Theme Integration**
- **Issue**: Hardcoded styles throughout components
- **Solution**: Comprehensive theme system with design tokens

## 📝 **Documentation Files**

### **Analysis Documents**
- **CONTEXT_ANALYSIS.md**: Detailed provider analysis
- **CONTEXT_OPTIMIZATION.md**: Optimization guide
- **FIXES_SUMMARY.md**: Recent fixes and solutions
- **OPTIMIZATION_SUMMARY.md**: Completed optimizations
- **theme/README.md**: Comprehensive theme system documentation

## 🎯 **Quick Reference**

### **Key Files to Check**
1. **App.js**: Main application structure with theme integration
2. **TimelineProvider.js**: Timeline management
3. **Editor.js**: Main editor interface
4. **constants/timeline.js**: Timeline constants
5. **hooks/useBeatManager.js**: Beat management
6. **providers/CollisionsProvider/**: Core collision logic
7. **theme/**: Complete theme system

### **Common Patterns**
- **Provider Pattern**: Context-based state management
- **Hook Pattern**: Custom hooks for reusable logic
- **Component Pattern**: Functional components with hooks
- **Styled Components**: CSS-in-JS styling with theme integration
- **Theme Pattern**: Design token system for consistent styling

## 🚀 **Development Workflow**

### **Adding New Features**
1. Check existing providers for related functionality
2. Create focused providers for new features
3. Extract utilities to appropriate files
4. Update documentation
5. Test performance impact
6. Use theme system for consistent styling

### **Debugging**
1. Check provider hierarchy
2. Verify context access patterns
3. Review performance optimizations
4. Check for circular dependencies
5. Ensure theme integration

## 🔄 **Data Flow Patterns**

### **Overlap Group Management**
1. **Creation**: Elements are grouped when they overlap in time and space
2. **Processing**: `useProcessBeat` handles overlap detection and grouping
3. **Storage**: Groups are stored in `overlapGroups` state
4. **Rendering**: Groups are rendered as single elements with child elements

### **Beat Management**
1. **Saving**: Beats are saved with full `overlapGroups` data
2. **Loading**: Beats restore the complete state including overlaps
3. **History**: Changes are tracked for undo/redo functionality

### **Sound Event Lifecycle**
1. **Creation**: Events are created via `createSound` or `createEvent`
2. **Recording**: Events are recorded and added to overlap groups
3. **Processing**: Events are processed for overlaps and grouping
4. **Rendering**: Events are rendered as Konva elements

### **Theme Integration**
1. **Design Tokens**: Consistent colors, typography, spacing, and other design values
2. **Component Styling**: Styled components use theme tokens
3. **Global Styles**: Consistent base styling across the application
4. **Customization**: Easy theme extension and customization

This cache file provides a comprehensive overview of the project structure, key components, data structures, theme system, and important patterns for efficient development and debugging.

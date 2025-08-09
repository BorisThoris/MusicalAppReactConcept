# React Context Analysis & Optimization Recommendations

## 🔍 **Detailed Analysis Results**

### **1. CollisionsProvider - CAN BE BROKEN DOWN**

**Current Issues:**
- **Too many responsibilities**: Handles overlaps, beats, timeline refs, history, storage, and more
- **Large context value**: 40+ properties in context value
- **Complex state management**: Multiple interconnected states
- **Helper functions inside component**: Should be extracted

**Recommended Breakdown:**

#### A. **BeatProvider** (New)
```jsx
// src/providers/BeatProvider.js
export const BeatProvider = ({ children }) => {
    const [beats, saveBeatsToLocalStorage] = useBeats();
    const [selectedBeat, setSelectedBeat] = useState(null);
    const [currentBeat, setCurrentBeat] = useState(null);
    
    // Beat-related logic only
    return <BeatContext.Provider value={...}>{children}</BeatContext.Provider>;
};
```

#### B. **TimelineRefsProvider** (New)
```jsx
// src/providers/TimelineRefsProvider.js
export const TimelineRefsProvider = ({ children }) => {
    const timelineRefs = useRef({});
    const stageRef = useRef(null);
    
    // Timeline refs logic only
    return <TimelineRefsContext.Provider value={...}>{children}</TimelineRefsContext.Provider>;
};
```

#### C. **OverlapProvider** (New)
```jsx
// src/providers/OverlapProvider.js
export const OverlapProvider = ({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [processedItems, setProcessedItems] = useState([]);
    
    // Overlap calculation logic only
    return <OverlapContext.Provider value={...}>{children}</OverlapContext.Provider>;
};
```

#### D. **HistoryProvider** (New)
```jsx
// src/providers/HistoryProvider.js
export const HistoryProvider = ({ children }) => {
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    
    // History management logic only
    return <HistoryContext.Provider value={...}>{children}</HistoryContext.Provider>;
};
```

### **2. SoundEventDragProvider - CAN BE OPTIMIZED**

**Current Issues:**
- **Large component**: 338 lines
- **Helper functions inside component**: Should be extracted
- **Complex drag logic**: Can be broken into smaller hooks

**Recommended Optimizations:**

#### A. **Extract Helper Functions**
```jsx
// src/utils/dragHelpers.js
export const extractElementIdsFromGroup = (groupElm, targetId) => {
    return Object.values(groupElm.elements)
        .filter((child) => targetId === child.id)
        .map((child) => child.id);
};

export const applyHighlightToTimeline = (timeline) => {
    if (timeline) {
        timeline.fill('yellow');
        timeline.getLayer().draw();
    }
};

export const removeHighlightFromTimeline = (timeline) => {
    if (timeline) {
        timeline.fill('white');
        timeline.getLayer().draw();
    }
};
```

#### B. **Extract Drag Hooks**
```jsx
// src/hooks/useDragDetection.js
export const useDragDetection = (stageRef) => {
    const findClosestTimelineEvents = useCallback((element) => {
        // Drag detection logic
    }, [stageRef]);
    
    const findClosestTimelineRect = useCallback((element) => {
        // Timeline rect detection logic
    }, [stageRef]);
    
    return { findClosestTimelineEvents, findClosestTimelineRect };
};
```

### **3. SelectionsProvider - CAN BE SIMPLIFIED**

**Current Issues:**
- **Complex selection logic**: Can be extracted to hooks
- **Panel integration**: Should be separated
- **Memoization issues**: Can be optimized

**Recommended Optimizations:**

#### A. **Extract Selection Logic**
```jsx
// src/hooks/useSelectionManager.js
export const useSelectionManager = (markersAndTrackerOffset) => {
    const [selectedItems, setSelectedItems] = useState({});
    const [highestYLevel, setHighestYLevel] = useState(0);
    
    // Selection management logic
    return { selectedItems, setSelectedItems, highestYLevel };
};
```

#### B. **Extract Panel Integration**
```jsx
// src/hooks/useSelectionPanel.js
export const useSelectionPanel = (selectedItems, panels) => {
    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const panelNotOpen = !panels[SELECTIONS_PANEL_ID];
        
        if (isSelectedItemsNotEmpty && panelNotOpen) {
            openSelectionsPanel();
        }
    }, [selectedItems, panels]);
};
```

### **4. PaintingProvider - CAN BE SIMPLIFIED**

**Current Issues:**
- **Simple logic**: Could be a hook instead of provider
- **Limited state**: Only paintingTarget state

**Recommended Optimization:**

#### A. **Convert to Hook**
```jsx
// src/hooks/usePainting.js
export const usePainting = () => {
    const pixelToSecondRatio = usePixelRatio();
    const [paintingTarget, setPaintingTarget] = useState(null);
    
    const paintEvent = useCallback(({ renderEvent, target, x }) => {
        // Painting logic
    }, [paintingTarget, pixelToSecondRatio]);
    
    return { paintEvent, paintingTarget, setPaintingTarget };
};
```

### **5. TimelineProvider - CAN BE OPTIMIZED**

**Current Issues:**
- **Simple calculations**: Can be extracted to helpers
- **Constants**: Should be moved to constants file

**Recommended Optimizations:**

#### A. **Extract Constants**
```jsx
// src/constants/timeline.js
export const TIMELINE_CONSTANTS = {
    HEIGHT: 200,
    Y_OFFSET: 20,
    MARKERS_HEIGHT: 50,
    PANEL_COMPENSATION_OFFSET: { x: -60 }
};
```

#### B. **Extract Calculations**
```jsx
// src/utils/timelineHelpers.js
export const calculateStageWidth = (pixelToSecondRatio) => {
    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    return window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;
};
```

## 🎯 **Implementation Plan**

### **Phase 1: Extract Helper Functions**
1. Create `src/utils/` directory
2. Extract pure functions from providers
3. Create `src/constants/` directory
4. Move constants to separate files

### **Phase 2: Create New Hooks**
1. Create `src/hooks/useBeatManager.js`
2. Create `src/hooks/useTimelineRefs.js`
3. Create `src/hooks/useOverlapManager.js`
4. Create `src/hooks/useHistoryManager.js`

### **Phase 3: Break Down Large Providers**
1. Split `CollisionsProvider` into smaller providers
2. Convert `PaintingProvider` to hook
3. Optimize `SoundEventDragProvider`
4. Simplify `SelectionsProvider`

### **Phase 4: Optimize Context Hierarchy**
1. Reorganize provider order
2. Remove unnecessary providers
3. Combine related providers
4. Update documentation

## 📊 **Performance Impact**

### **Expected Improvements:**
- **Reduced re-renders**: 30-50% reduction
- **Better code organization**: Clearer separation of concerns
- **Easier testing**: Smaller, focused components
- **Better maintainability**: Modular structure

### **Risk Assessment:**
- **Low risk**: Most changes are internal refactoring
- **Backward compatibility**: Maintain existing APIs
- **Gradual migration**: Can be done incrementally

## 🔧 **Specific Code Examples**

### **Before (CollisionsProvider):**
```jsx
// 200+ lines of complex logic
export const CollisionsProvider = ({ children }) => {
    // 40+ state variables
    // 20+ helper functions
    // Complex context value
    return <CollisionsContext.Provider value={...}>{children}</CollisionsContext.Provider>;
};
```

### **After (Modular Structure):**
```jsx
// BeatProvider - 50 lines
export const BeatProvider = ({ children }) => {
    const { beats, selectedBeat, currentBeat } = useBeatManager();
    return <BeatContext.Provider value={{ beats, selectedBeat, currentBeat }}>{children}</BeatContext.Provider>;
};

// TimelineRefsProvider - 40 lines
export const TimelineRefsProvider = ({ children }) => {
    const { stageRef, timelineRefs } = useTimelineRefs();
    return <TimelineRefsContext.Provider value={{ stageRef, timelineRefs }}>{children}</TimelineRefsContext.Provider>;
};

// OverlapProvider - 60 lines
export const OverlapProvider = ({ children }) => {
    const { overlapGroups, processedItems } = useOverlapManager();
    return <OverlapContext.Provider value={{ overlapGroups, processedItems }}>{children}</OverlapContext.Provider>;
};
```

## 🎯 **Next Steps**

1. **Start with helper extraction**: Create utility functions
2. **Create new hooks**: Implement focused hooks
3. **Break down providers**: Split large providers
4. **Update tests**: Ensure all functionality works
5. **Document changes**: Update documentation

This analysis provides a clear roadmap for optimizing your React context structure while maintaining functionality and improving performance.

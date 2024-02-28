import React, { createContext, useMemo, useState } from 'react';

export const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
    const [timelineState, setTimelineState] = useState({
        canvasOffsetY: undefined,
        // Assuming a global lock state, adjust as necessary for per-timeline locks
        focusedEvent: null,
        isLocked: false,

        timelineY: undefined // Adjust based on how focused events are determined
    });

    const updateTimelineState = (updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    };

    // Add any other relevant state updates or utility functions here
    const toggleLock = () => {
        setTimelineState((prevState) => ({
            ...prevState,
            isLocked: !prevState.isLocked
        }));
    };

    // Memoize the context value
    const value = useMemo(
        () => ({
            setTimelineState,
            timelineState,
            toggleLock,
            updateTimelineState
        }),
        [timelineState]
    );

    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

export default TimelineProvider;

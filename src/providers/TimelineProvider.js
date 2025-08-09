import React, { createContext, useCallback, useMemo, useState } from 'react';
import { DEFAULT_TIMELINE_STATE, MARKERS_AND_TRACKER_OFFSET, TIMELINE_CONSTANTS } from '../constants/timeline';
import threeMinuteMs from '../globalConstants/songLimit';
import { usePixelRatio } from './PixelRatioProvider/PixelRatioProvider';

export const TimelineContext = createContext(DEFAULT_TIMELINE_STATE);

// Re-export constants for backward compatibility
export const { HEIGHT: TimelineHeight, MARKERS_HEIGHT: markersHeight, Y_OFFSET } = TIMELINE_CONSTANTS;
export const markersAndTrackerOffset = MARKERS_AND_TRACKER_OFFSET;

// Extracted calculation function
const calculateStageWidth = (pixelToSecondRatio) => {
    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    return window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;
};

export const TimelineProvider = ({ children }) => {
    const pixelToSecondRatio = usePixelRatio();
    const [timelineState, setTimelineState] = useState(DEFAULT_TIMELINE_STATE);

    // Function to update the timeline state
    const updateTimelineState = useCallback((updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // Pre-calculate a width based on the maximum allowed sound duration
    const calculatedStageWidth = useMemo(() => {
        return calculateStageWidth(pixelToSecondRatio);
    }, [pixelToSecondRatio]);

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            ...timelineState,
            calculatedStageWidth,
            updateTimelineState
        }),
        [timelineState, calculatedStageWidth, updateTimelineState]
    );

    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

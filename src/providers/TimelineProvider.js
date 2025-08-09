import React, { createContext, useCallback, useMemo, useState } from 'react';
import threeMinuteMs from '../globalConstants/songLimit';
import { usePixelRatio } from './PixelRatioProvider/PixelRatioProvider';

export const TimelineHeight = 200;
export const Y_OFFSET = 20;
export const markersHeight = 50;
export const panelCompensationOffset = { x: -60 };
export const markersAndTrackerOffset = markersHeight + Y_OFFSET;

const defaultTimelineState = {
    furthestEndTimes: 0,
    markersAndTrackerOffset,
    markersHeight,
    panelCompensationOffset,
    stageWidth: 0,
    TimelineHeight
};
export const TimelineContext = createContext(defaultTimelineState);

export const TimelineProvider = ({ children }) => {
    const pixelToSecondRatio = usePixelRatio();
    const [timelineState, setTimelineState] = useState(defaultTimelineState);

    // Function to update the timeline state
    const updateTimelineState = useCallback((updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // Pre-calculate a width based on the maximum allowed sound duration
    const calculatedStageWidth = useMemo(() => {
        const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
        return window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;
    }, [pixelToSecondRatio]);

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            calculatedStageWidth,
            timelineState,
            updateTimelineState
        }),
        [calculatedStageWidth, timelineState, updateTimelineState]
    );

    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

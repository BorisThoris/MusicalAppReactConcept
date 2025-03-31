import React, { createContext, useMemo, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import threeMinuteMs from '../globalConstants/songLimit';

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
    const [timelineState, setTimelineState] = useState(defaultTimelineState);

    // Function to update the timeline state
    const updateTimelineState = (updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    };

    // Pre-calculate a width based on the maximum allowed sound duration
    const widthBasedOnLastSound = threeMinuteMs / pixelToSecondRatio;
    const calculatedStageWidth = window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            calculatedStageWidth,
            timelineState,
            updateTimelineState
        }),
        [calculatedStageWidth, timelineState]
    );

    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

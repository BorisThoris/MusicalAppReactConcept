import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import threeMinuteMs from '../globalConstants/songLimit';
import useStageWidth from '../hooks/useStageWidth';
import { CollisionsContext } from './CollisionsProvider/CollisionsProvider';

export const TimelineHeight = 200;
export const Y_OFFSET = 20;
export const markersHeight = 50;
const panelCompensationOffset = { x: -60 };
export const markersAndTrackerOffset = markersHeight + Y_OFFSET;

const defaultTimelineState = {
    furthestEndTime: 0,
    furthestEndTimes: 0,
    markersAndTrackerOffset,
    markersHeight,
    panelCompensationOffset,
    stageWidth: 0,
    TimelineHeight
};
export const TimelineContext = createContext(defaultTimelineState);

export const TimelineProvider = ({ children }) => {
    const { overlapGroups } = useContext(CollisionsContext);
    const { furthestEndTime, furthestEndTimes } = useStageWidth({ overlapGroups });

    const [timelineState, setTimelineState] = useState(defaultTimelineState);

    // Function to calculate the stage width
    const calculateStageWidth = useCallback(() => {
        const widthBasedOnLastSound = furthestEndTime * pixelToSecondRatio;
        return window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;
    }, [furthestEndTime]);

    // Effect to update stage width when relevant values change
    useEffect(() => {
        const calculatedStageWidth = calculateStageWidth();

        setTimelineState((prevState) => ({
            ...prevState,
            furthestEndTime,
            furthestEndTimes,
            stageWidth: calculatedStageWidth
        }));
    }, [furthestEndTime, furthestEndTimes, overlapGroups, calculateStageWidth]);

    // Add event listener for window resize to update the stage width
    useEffect(() => {
        const handleResize = () => {
            const newStageWidth = calculateStageWidth();
            setTimelineState((prevState) => ({
                ...prevState,
                stageWidth: newStageWidth
            }));
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculateStageWidth]);

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

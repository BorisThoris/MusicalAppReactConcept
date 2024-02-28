import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import pixelToSecondRatio from '../globalConstants/pixelToSeconds';
import useStageWidth from '../hooks/useStageWidth';
import { InstrumentRecordingsContext } from './InstrumentsProvider';

export const TimelineContext = createContext();

export const TimelineProvider = ({ children }) => {
    const { recordings } = useContext(InstrumentRecordingsContext);
    const { furthestEndTime, furthestEndTimes } = useStageWidth({ recordings });

    const [timelineState, setTimelineState] = useState({
        furthestEndTime: 0,
        furthestEndTimes: 0,
        panelCompensationOffset: { x: -60 },
        stageWidth: 0
    });

    // Calculate stage width based on recordings
    useEffect(() => {
        const widthBasedOnLastSound = furthestEndTime * pixelToSecondRatio;
        const calculatedStageWidth =
            window.innerWidth > widthBasedOnLastSound ? window.innerWidth : widthBasedOnLastSound;

        setTimelineState((prevState) => ({
            ...prevState,
            furthestEndTime,
            furthestEndTimes,
            stageWidth: calculatedStageWidth
        }));
    }, [furthestEndTime, furthestEndTimes, recordings]); // React to changes in recordings

    const updateTimelineState = (updates) => {
        setTimelineState((prevState) => ({
            ...prevState,
            ...updates
        }));
    };

    // Memoize the context value to avoid unnecessary re-renders
    const value = useMemo(
        () => ({
            timelineState,
            updateTimelineState
        }),
        [timelineState]
    );

    return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
};

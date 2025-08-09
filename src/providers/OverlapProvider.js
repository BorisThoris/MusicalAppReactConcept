import React, { createContext, useContext, useMemo, useState } from 'react';
import { useFurthestEndTime } from './CollisionsProvider/hooks/useFurthestEndTime';
import { useProcessBeat } from './CollisionsProvider/hooks/useProcessBeat';
import { findOverlaps } from './CollisionsProvider/overlapHelpers';

const OverlapContext = createContext();

export const useOverlapContext = () => {
    const context = useContext(OverlapContext);
    if (!context) {
        throw new Error('useOverlapContext must be used within an OverlapProvider');
    }
    return context;
};

export const OverlapProvider = ({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [processedItems, setProcessedItems] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);

    // This will be provided by TimelineRefsProvider
    const { getProcessedElements, getProcessedGroups, timelineRefs } =
        useContext(require('./TimelineRefsProvider').TimelineRefsContext) || {};

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });
    const { furthestEndTime, totalDurationInPixels } = useFurthestEndTime(() => []); // This will be provided by TimelineRefsProvider

    const value = useMemo(
        () => ({
            furthestEndTime,
            hasChanged,
            overlapGroups,
            processBeat,
            processedItems,
            setHasChanged,
            setOverlapGroups,
            setProcessedItems,
            totalDurationInPixels
        }),
        [overlapGroups, processedItems, hasChanged, processBeat, furthestEndTime, totalDurationInPixels]
    );

    return <OverlapContext.Provider value={value}>{children}</OverlapContext.Provider>;
};

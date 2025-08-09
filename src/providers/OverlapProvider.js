import React, { createContext, useContext, useMemo, useState } from 'react';
import { useFurthestEndTime } from './CollisionsProvider/hooks/useFurthestEndTime';
import { useProcessBeat } from './CollisionsProvider/hooks/useProcessBeat';
import { findOverlaps } from './CollisionsProvider/overlapHelpers';
import { TimelineRefsContext } from './TimelineRefsProvider';

export const OverlapContext = createContext();

export const useOverlapContext = () => {
    const context = useContext(OverlapContext);
    if (!context) {
        throw new Error('useOverlapContext must be used within an OverlapProvider');
    }
    return context;
};

export const OverlapProvider = ({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [processedItems, setProcessedItems] = useState({});

    const { findAllSoundEventElements, getProcessedElements, getProcessedGroups, timelineRefs } =
        useContext(TimelineRefsContext) || {};

    const { furthestEndTime } = useFurthestEndTime(findAllSoundEventElements || (() => []));
    const { processBeat } = useProcessBeat({
        getProcessedElements,
        getProcessedGroups,
        timelineRefs
    });

    const contextValue = useMemo(
        () => ({
            findOverlaps,
            furthestEndTime,
            overlapGroups,
            processBeat,
            processedItems,
            setOverlapGroups,
            setProcessedItems
        }),
        [overlapGroups, setOverlapGroups, processedItems, setProcessedItems, furthestEndTime, processBeat]
    );

    return <OverlapContext.Provider value={contextValue}>{children}</OverlapContext.Provider>;
};

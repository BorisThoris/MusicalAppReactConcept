import isEqual from 'lodash/isEqual';
import { useCallback, useMemo, useState } from 'react';
import { useFurthestEndTime } from '../providers/CollisionsProvider/hooks/useFurthestEndTime';
import { useProcessBeat } from '../providers/CollisionsProvider/hooks/useProcessBeat';
import { findOverlaps } from '../providers/CollisionsProvider/overlapHelpers';

export const useOverlapManager = (getProcessedElements, getProcessedGroups, timelineRefs) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [processedItems, setProcessedItems] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);

    const { processBeat } = useProcessBeat({ getProcessedElements, getProcessedGroups, timelineRefs });
    const { furthestEndTime, totalDurationInPixels } = useFurthestEndTime(getProcessedElements || (() => []));

    const calculateOverlapGroups = useCallback((currentBeat, isDragging, prevBeat) => {
        if (!currentBeat || isDragging) return null;

        const beatDiff = !isEqual(prevBeat, currentBeat);
        if (!beatDiff) return null;

        return findOverlaps(currentBeat);
    }, []);

    const updateOverlapGroups = useCallback((newOverlapGroups) => {
        setOverlapGroups(newOverlapGroups);
    }, []);

    const updateProcessedItems = useCallback((newProcessedItems) => {
        setProcessedItems(newProcessedItems);
    }, []);

    return {
        calculateOverlapGroups,
        furthestEndTime,
        hasChanged,
        overlapGroups,
        processBeat,
        processedItems,
        setHasChanged,
        setOverlapGroups: updateOverlapGroups,
        setProcessedItems: updateProcessedItems,
        totalDurationInPixels
    };
};

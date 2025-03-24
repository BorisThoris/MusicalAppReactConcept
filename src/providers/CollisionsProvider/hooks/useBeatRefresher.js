import isEqual from 'lodash/isEqual';
import { useCallback } from 'react';

/**
 * Custom hook to refresh the beat data.
 * It exposes a refreshBeat function that processes the current beat and updates state,
 * as well as an updateBeatRef function that avoids refreshes during dragging.
 */
export const useBeatRefresher = (
    currentBeat,
    processedItems,
    processBeat,
    getProcessedItems,
    isDragging,
    setCurrentBeat,
    setProcessedItems
) => {
    const refreshBeat = useCallback(() => {
        const newData = processBeat();
        const newProcessedItems = getProcessedItems();

        if (!isEqual(currentBeat, newData)) {
            setCurrentBeat({ ...newData });
            if (!isEqual(processedItems, newProcessedItems)) {
                setProcessedItems(newProcessedItems);
            }
        }
    }, [currentBeat, processedItems, getProcessedItems, processBeat, setCurrentBeat, setProcessedItems]);

    const updateBeatRef = useCallback(() => {
        if (isDragging) return;
        refreshBeat();
    }, [isDragging, refreshBeat]);

    return { refreshBeat, updateBeatRef };
};

import isEqual from 'lodash/isEqual';
import { useCallback } from 'react';

/**
 * Custom hook to refresh the beat data.
 * It ensures that timelines from `currentBeat` are persisted,
 * even if the new processed beat omits them (e.g. due to no events).
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

        // ✅ Only update state if there's a meaningful change
        if (!isEqual(currentBeat, newData)) {
            setCurrentBeat({ ...newData });

            if (!isEqual(processedItems, newProcessedItems)) {
                setProcessedItems(newProcessedItems);
            }
        }
    }, [currentBeat, processedItems, getProcessedItems, processBeat, setCurrentBeat, setProcessedItems]);

    const updateBeatRef = useCallback(
        (e) => {
            if (isDragging) return;
            refreshBeat();
        },
        [isDragging, refreshBeat]
    );

    return { refreshBeat, updateBeatRef };
};

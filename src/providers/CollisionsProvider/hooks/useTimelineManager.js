import { useCallback } from 'react';

/**
 * Custom hook to manage timeline operations.
 * In this case, it encapsulates the logic for adding a new timeline.
 */
export const useTimelineManager = (overlapGroups, setOverlapGroups) => {
    const addTimeline = useCallback(
        (passedName) => {
            setOverlapGroups((prevGroups) => {
                let newTimelineName = passedName ?? `Additional Timeline ${Object.keys(prevGroups).length + 1}`;
                // Ensure the name is unique
                let counter = 1;
                while (prevGroups[newTimelineName]) {
                    newTimelineName = passedName
                        ? `${passedName} (${counter})`
                        : `Additional Timeline ${Object.keys(prevGroups).length + counter}`;
                    counter += 1;
                }
                return {
                    ...prevGroups,
                    [newTimelineName]: {}
                };
            });
        },
        [setOverlapGroups]
    );

    return { addTimeline };
};

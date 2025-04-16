import { useCallback } from 'react';

/**
 * Custom hook to manage timeline operations.
 * Default names are now plain numbers ("1", "2", "3", …).
 */
export const useTimelineManager = (setOverlapGroups) => {
    const addTimeline = useCallback(
        (passedName) => {
            setOverlapGroups((prevGroups) => {
                // Determine starting number: either the passedName if provided, or next count
                let newTimelineName = passedName ?? `${Object.keys(prevGroups).length + 1}`;
                // Parse it as a number; if that’s NaN, switch to count+1
                let baseNumber = parseInt(newTimelineName, 10);
                if (Number.isNaN(baseNumber)) {
                    baseNumber = Object.keys(prevGroups).length + 1;
                    newTimelineName = `${baseNumber}`;
                }
                // Ensure uniqueness: bump the number until it's unused
                while (prevGroups[newTimelineName]) {
                    baseNumber += 1;
                    newTimelineName = `${baseNumber}`;
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

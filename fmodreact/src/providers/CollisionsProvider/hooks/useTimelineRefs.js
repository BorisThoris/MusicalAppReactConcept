import { useCallback, useState } from 'react';

export const useTimelineRefs = () => {
    const [timelineRefs, setTimelineRefs] = useState([]);

    console.log('REF CHANGE');

    // Add or update a timeline reference
    const addTimelineRef = useCallback((instrumentName, ref) => {
        setTimelineRefs((prevRefs) => {
            const existingRefIndex = prevRefs.findIndex((r) => r.instrumentName === instrumentName);
            if (existingRefIndex !== -1) {
                // If the ref already exists for this instrument, update it
                const updatedRefs = [...prevRefs];
                updatedRefs[existingRefIndex] = { instrumentName, ref };
                return updatedRefs;
            }
            // Otherwise, add a new ref
            return [...prevRefs, { instrumentName, ref }];
        });
    }, []);

    // Remove a timeline reference
    const removeTimelineRef = useCallback((instrumentName) => {
        setTimelineRefs((prevRefs) => prevRefs.filter((r) => r.instrumentName !== instrumentName));
    }, []);

    return {
        addTimelineRef,
        removeTimelineRef,
        timelineRefs
    };
};

export default useTimelineRefs;

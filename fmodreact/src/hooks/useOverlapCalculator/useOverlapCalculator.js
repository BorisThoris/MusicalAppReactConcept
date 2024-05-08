import { isEmpty, uniqBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import { combineOverlappingGroups, handleNonOverlappingEvent, mergeOverlappingEvents } from './GroupUtility';
import { findOverlappingGroups, insertGroupsIntoTree } from './IntervalTreeUtility';

export const processEvents = (overlapTree, recordingsForInstrument) => {
    const groups = [];

    recordingsForInstrument.forEach((recording) => {
        const interval = [recording.startTime, recording.endTime];
        const overlaps = findOverlappingGroups(recording, overlapTree);

        if (isEmpty(overlaps) && recording.events.length === 1) {
            groups.push(
                handleNonOverlappingEvent({
                    interval,
                    overlapTree,
                    recording
                })
            );
        } else {
            const updatedGroups = mergeOverlappingEvents({
                event: recording,
                groups,
                tree: overlapTree
            });

            const combinedGroups = combineOverlappingGroups(updatedGroups, overlapTree);
            groups.push(...combinedGroups);
        }
    });

    return uniqBy(groups, (e) => e.id);
};

export const processOverlapCalculations = (recordings, initializedOverlapGroups, instrument) => {
    const recordingsForInstrument = recordings[instrument];

    console.log(recordings);

    const initialOverlapGroups = new Set(initializedOverlapGroups[instrument] || []);

    const { tree } = insertGroupsIntoTree({ initialOverlapGroups });

    return processEvents(tree, recordingsForInstrument);
};

const useOverlapCalculator = (recordings, prevOverlapGroups) => {
    // Convert prevOverlapGroups to the expected array format if necessary
    const normalizeOverlapGroups = (groups) => {
        return Object.keys(groups).reduce((acc, key) => {
            const value = groups[key];
            // Check if the value is already in the correct format (array)
            if (Array.isArray(value)) {
                acc[key] = value;
            } else if (value instanceof Set) {
                // Convert Set to array
                acc[key] = Array.from(value);
            } else if (typeof value === 'object' && value !== null) {
                // Assuming the object's values are the recordings, convert to array
                acc[key] = Object.values(value);
            } else {
                // Fallback if the format is unrecognized
                acc[key] = [];
            }
            return acc;
        }, {});
    };

    const initializedOverlapGroups = useMemo(() => {
        return prevOverlapGroups ? normalizeOverlapGroups(prevOverlapGroups) : {};
    }, [prevOverlapGroups]);

    const calculateOverlapsForInstrument = useCallback(
        (instrument) => {
            return processOverlapCalculations(recordings, initializedOverlapGroups, instrument);
        },
        [recordings, initializedOverlapGroups]
    );

    const calculateOverlapsForAllInstruments = useCallback(() => {
        return Object.keys(recordings).reduce((acc, instrument) => {
            acc[instrument] = calculateOverlapsForInstrument(instrument);
            return acc;
        }, {});
    }, [recordings, calculateOverlapsForInstrument]);

    return { calculateOverlapsForAllInstruments };
};

export default useOverlapCalculator;

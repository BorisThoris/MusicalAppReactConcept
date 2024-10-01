import { isEmpty } from 'lodash';
import { useCallback, useMemo } from 'react';
import { combineOverlappingGroups, handleNonOverlappingEvent, mergeOverlappingEvents } from './GroupUtility';
import { findOverlappingGroups, insertGroupsIntoTree } from './IntervalTreeUtility';

const processEvents = (overlapTree, recordingsForInstrument) => {
    let groups = {};

    Object.values(recordingsForInstrument).forEach((recording) => {
        const interval = [recording.startTime, recording.endTime];
        const overlaps = findOverlappingGroups(recording, overlapTree);

        if (isEmpty(overlaps) && recording.events && Object.keys(recording.events)?.length === 1) {
            const nonOverlappingEvent = handleNonOverlappingEvent({
                interval,
                overlapTree,
                recording
            });
            groups[nonOverlappingEvent.id] = nonOverlappingEvent;
        } else {
            const updatedGroups = mergeOverlappingEvents({
                event: recording,
                groups,
                tree: overlapTree
            });

            groups = combineOverlappingGroups(updatedGroups, overlapTree);
        }

        // Check and process future overlaps
        const futureOverlaps = findOverlappingGroups(recording, overlapTree, { future: true });
        if (!isEmpty(futureOverlaps)) {
            const futureUpdatedGroups = mergeOverlappingEvents({
                event: recording,
                groups,
                tree: overlapTree
            });

            groups = combineOverlappingGroups(futureUpdatedGroups, overlapTree);
        }
    });

    return groups;
};

const processOverlapCalculations = (recordings, initializedOverlapGroups, instrument) => {
    const recordingsForInstrument = recordings[instrument];
    const initialOverlapGroups = initializedOverlapGroups[instrument];
    const iterableGroups = initialOverlapGroups ? Object.values(initialOverlapGroups) : [];
    const initialOverlapGroupsSet = new Set(iterableGroups);
    const { tree } = insertGroupsIntoTree({ initialOverlapGroups: initialOverlapGroupsSet });

    return processEvents(tree, recordingsForInstrument);
};

export const useOverlapCalculator = (recordings, prevOverlapGroups) => {
    const initializedOverlapGroups = useMemo(() => {
        return prevOverlapGroups || {};
    }, [prevOverlapGroups]);

    const calculateOverlapsForInstrument = useCallback(
        (instrument) => {
            return processOverlapCalculations(recordings, initializedOverlapGroups, instrument);
        },
        [recordings, initializedOverlapGroups]
    );

    const calculateOverlapsForAllInstruments = useCallback(
        (passedRecordings) => {
            return Object.keys(passedRecordings || recordings).reduce((acc, instrument) => {
                acc[instrument] = calculateOverlapsForInstrument(instrument);
                return acc;
            }, {});
        },
        [recordings, calculateOverlapsForInstrument]
    );

    return { calculateOverlapsForAllInstruments };
};

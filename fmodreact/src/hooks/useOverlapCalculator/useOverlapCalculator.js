import { isEmpty, reduce, uniqBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import {
    combineOverlappingGroups,
    handleNonOverlappingEvent,
    mergeOverlappingEvents,
} from './GroupUtility';
import {
    findOverlappingGroups,
    insertGroupsIntoTree,
} from './IntervalTreeUtility';

const useOverlapCalculator = (recordings, prevOverlapGroups) => {
    const initializedOverlapGroups = useMemo(
        () => prevOverlapGroups || {},
        [prevOverlapGroups]
    );

    const processEvents = useCallback(
        ({ overlapTree, recordingsForInstrument }) => {
            const groups = [];

            recordingsForInstrument.forEach((recording) => {
                const interval = [recording.startTime, recording.endTime];
                const overlaps = findOverlappingGroups(recording, overlapTree);

                if (isEmpty(overlaps) && recording.events.length === 1) {
                    groups.push(
                        handleNonOverlappingEvent({
                            interval,
                            overlapTree,
                            recording,
                        })
                    );
                } else {
                    const updatedGroups = mergeOverlappingEvents({
                        event: recording,
                        groups,
                        overlaps,
                        recordings: recordingsForInstrument,
                        tree: overlapTree,
                    });

                    // Combine and update the groups array in place
                    const combinedGroups = combineOverlappingGroups(
                        updatedGroups,
                        overlapTree
                    );
                    groups.length = 0;
                    groups.push(...combinedGroups);
                }
            });

            return {
                orhpans: [],
                processedGroups: uniqBy(groups, (e) => e.id),
            };
        },
        []
    );

    const processOverlapCalculations = useCallback(
        (instrument) => {
            const recordingsForInstrument = recordings[instrument];
            const initialOverlapGroups = new Set(
                initializedOverlapGroups[instrument] || []
            );

            const { tree } = insertGroupsIntoTree({ initialOverlapGroups });

            const { processedGroups } = processEvents({
                overlapTree: tree,
                recordingsForInstrument,
            });

            const mergedGroups = new Set([...processedGroups]);

            return Array.from(processedGroups);
        },
        [initializedOverlapGroups, processEvents, recordings]
    );

    const calculateOverlaps = useCallback(() => {
        const instrument = Object.keys(recordings)[0];
        return processOverlapCalculations(instrument);
    }, [recordings, processOverlapCalculations]);

    const calculateOverlapsForAllInstruments = useCallback(() => {
        return Object.keys(recordings).reduce((acc, instrument) => {
            acc[instrument] = processOverlapCalculations(instrument);
            return acc;
        }, {});
    }, [recordings, processOverlapCalculations]);

    return { calculateOverlaps, calculateOverlapsForAllInstruments };
};

export default useOverlapCalculator;

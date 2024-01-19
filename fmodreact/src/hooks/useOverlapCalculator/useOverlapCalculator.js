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
        ({ overlapTree, recordingsForInstrument }) =>
            reduce(
                recordingsForInstrument,
                (accGroups, recording) => {
                    const interval = [recording.startTime, recording.endTime];

                    const overlaps = findOverlappingGroups(
                        recording,
                        overlapTree
                    );

                    if (isEmpty(overlaps)) {
                        const test = [
                            ...accGroups,
                            handleNonOverlappingEvent({
                                interval,
                                overlapTree,
                                recording,
                            }),
                        ];

                        return uniqBy(test, (e) => {
                            return e.id;
                        });
                    }

                    const updatedGroups = mergeOverlappingEvents({
                        event: recording,
                        groups: accGroups,
                        overlaps,
                        recordings: recordingsForInstrument,
                        tree: overlapTree,
                    });

                    return combineOverlappingGroups(updatedGroups, overlapTree);
                },
                []
            ),
        []
    );

    const processOverlapCalculations = useCallback(
        (instrument) => {
            const recordingsForInstrument = recordings[instrument];

            const initialOverlapGroups = new Set(
                initializedOverlapGroups[instrument] || []
            );

            const { tree } = insertGroupsIntoTree({ initialOverlapGroups });

            const processedGroups = processEvents({
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

/* eslint-disable no-restricted-syntax */
import { cloneDeep } from 'lodash';
import PropTypes from 'prop-types';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createEventInstance } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';
import useOverlapCalculator from '../hooks/useOverlapCalculator/useOverlapCalculator';

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = React.memo(({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const prevOverlapGroupsRef = useRef({});

    const [localLoaded, setLocalLoaded] = useState(false);

    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(
        overlapGroups,
        overlapGroups
    );

    useEffect(() => {
        const newOverlapGroups = calculateOverlapsForAllInstruments();

        const isOverlapGroupsChanged =
            JSON.stringify(newOverlapGroups) !==
            JSON.stringify(prevOverlapGroupsRef.current);

        function findDifferences(obj1, obj2, parentKey = '') {
            if (obj1 === obj2) return;

            if (
                typeof obj1 !== 'object' ||
                typeof obj2 !== 'object' ||
                obj1 == null ||
                obj2 == null
            ) {
                console.log(`Difference at ${parentKey}:`, obj1, obj2);
                return;
            }

            const allKeys = new Set([
                ...Object.keys(obj1),
                ...Object.keys(obj2),
            ]);
            for (const key of allKeys) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                findDifferences(obj1[key], obj2[key], newKey);
            }
        }

        // Example usage
        findDifferences(newOverlapGroups, prevOverlapGroupsRef.current);

        if (isOverlapGroupsChanged) {
            console.log('YOOOOOOOOOO');

            setOverlapGroups(newOverlapGroups);
            prevOverlapGroupsRef.current = cloneDeep(newOverlapGroups);
        }
    }, [calculateOverlapsForAllInstruments]);

    useEffect(() => {
        const savedOverlapGroups = JSON.parse(
            localStorage.getItem('overlapGroups')
        );

        if (savedOverlapGroups) {
            try {
                const parsedOverlapGroups = savedOverlapGroups;
                setOverlapGroups(parsedOverlapGroups);
            } catch (e) {
                console.error(
                    'Failed to parse overlapGroups from localStorage',
                    e
                );
            }
        }
    }, []);

    const recreateEvents = useCallback(() => {
        if (overlapGroups) {
            const parsedRecordings = overlapGroups;
            const newRecordings = {};

            Object.keys(parsedRecordings).forEach((instrumentName) => {
                newRecordings[instrumentName] = parsedRecordings[
                    instrumentName
                ].map((recording) => {
                    const eventInstance = createEventInstance(
                        recording.eventPath || 'Drum/Snare'
                    );

                    const event = createSound({
                        eventInstance,
                        eventPath: recording.eventPath || 'Drum/Snare',
                        instrumentName,
                        passedParams: recording.params,
                        startTime: recording.startTime,
                    });

                    // DIRTY GROUP FIX
                    // Create a new group object

                    const mappedEvents = [];
                    if (recording.events?.length > 1) {
                        recording.events.forEach((e) => {
                            mappedEvents.push({ ...e, events: undefined });
                        });
                    } else {
                        mappedEvents.push({ ...event, events: undefined });
                    }

                    return {
                        ...event,
                        endTime: event.endTime,
                        eventLength: event.eventLength,
                        events: mappedEvents,
                        id: `${event.id}`,
                        instrumentName: event.instrumentName,
                        length: event.eventLength,
                        locked: event.locked,
                        startTime: event.startTime,
                    };
                });
            });

            setOverlapGroups(newRecordings);
        }
    }, [overlapGroups]);

    useEffect(() => {
        if (!localLoaded && Object.keys(overlapGroups).length > 0) {
            console.log(
                ' RECREATING RECREATING RECREATING RECREATING RECREATING'
            );
            console.log(overlapGroups);

            recreateEvents();
            setLocalLoaded(true);
        }
    }, [localLoaded, overlapGroups, recreateEvents]);

    useEffect(() => {
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
    }, [overlapGroups]);

    const contextValue = useMemo(
        () => ({
            overlapGroups,
            recordings: overlapGroups,
            setOverlapGroups,
            setRecordings: setOverlapGroups,
        }),
        [overlapGroups]
    );

    return (
        <InstrumentRecordingsContext.Provider value={contextValue}>
            {children}
        </InstrumentRecordingsContext.Provider>
    );
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default InstrumentRecordingsProvider;

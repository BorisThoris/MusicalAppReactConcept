/* eslint-disable no-loop-func */
import PropTypes from 'prop-types';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { createEventInstance } from '../fmodLogic/eventInstanceHelpers';
import createSound from '../globalHelpers/createSound';

const isOverlapping = (event1, event2) =>
    event1.startTime < event2.endTime && event2.startTime < event1.endTime;

const isGroupOverlapping = (group1, group2) =>
    group1.startTime < group2.endTime && group2.startTime < group1.endTime;

const groupOverlappingSounds = (instrumentGroup) => {
    let overlapGroups = [];
    const visited = new Set();

    instrumentGroup.forEach((event, i) => {
        if (!visited.has(i)) {
            const group = {
                endTime: event.endTime,
                events: [event],
                id: event.id,
                instrumentName: event.instrumentName,
                startTime: event.startTime,
            };
            visited.add(i);

            instrumentGroup.forEach((otherEvent, j) => {
                if (
                    i !== j &&
                    !visited.has(j) &&
                    isOverlapping(event, otherEvent)
                ) {
                    group.startTime = Math.min(
                        group.startTime,
                        otherEvent.startTime
                    );
                    group.endTime = Math.max(group.endTime, otherEvent.endTime);
                    group.events.push(otherEvent);
                    group.id += otherEvent.id;
                    visited.add(j);
                }
            });

            // Sort the events in the group by startTime
            group.events.sort((a, b) => a.startTime - b.startTime);

            overlapGroups.push(group);
        }
    });

    let merged = true;
    while (merged) {
        merged = false;
        const newOverlapGroups = [];

        overlapGroups.forEach((group) => {
            const existingGroupIndex = newOverlapGroups.findIndex(
                (existingGroup) => isGroupOverlapping(group, existingGroup)
            );

            if (existingGroupIndex !== -1) {
                const mergedGroup = newOverlapGroups[existingGroupIndex];
                mergedGroup.startTime = Math.min(
                    mergedGroup.startTime,
                    group.startTime
                );
                mergedGroup.endTime = Math.max(
                    mergedGroup.endTime,
                    group.endTime
                );
                mergedGroup.events = [
                    ...new Set([...mergedGroup.events, ...group.events]),
                ];

                // Sort the events in the merged group by startTime
                mergedGroup.events.sort((a, b) => a.startTime - b.startTime);

                mergedGroup.id += group.id;
                merged = true;
            } else {
                newOverlapGroups.push(group);
            }
        });

        overlapGroups = newOverlapGroups;
    }

    return overlapGroups;
};

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () =>
    useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = ({ children }) => {
    const [recordings, setRecordings] = useState({});
    const [overlapGroups, setOverlapGroups] = useState({});
    const [localLoaded, setLocalLoaded] = useState(false);

    const processOverlapGroups = useCallback(() => {
        const newOverlapGroups = {};
        Object.keys(recordings).forEach((instrument) => {
            newOverlapGroups[instrument] = groupOverlappingSounds(
                recordings[instrument]
            );
        });
        return newOverlapGroups;
    }, [recordings]);

    const recreateEvents = useCallback(() => {
        const savedRecordings = localStorage.getItem('recordings');

        if (savedRecordings) {
            const test = JSON.parse(savedRecordings);
            const newRecordings = {};

            Object.keys(test).forEach((instrumentName) => {
                newRecordings[instrumentName] = test[instrumentName].map(
                    (recording) => {
                        const eventInstance = createEventInstance(
                            recording.eventPath || 'Drum/Snare'
                        );

                        return createSound({
                            eventInstance,
                            eventPath: recording.eventPath || 'Drum/Snare',
                            instrumentName,
                            passedParams: recording.params,
                            startTime: recording.startTime,
                        });
                    }
                );
            });

            setRecordings(newRecordings);
        }
    }, []);

    useEffect(() => {
        const savedRecordings = localStorage.getItem('recordings');

        if (
            !localLoaded &&
            Object.keys(recordings).length === 0 &&
            savedRecordings
        ) {
            recreateEvents();
            setLocalLoaded(true);
        }
    }, [localLoaded, recordings, recreateEvents]);

    useEffect(() => {
        const processedGroups = processOverlapGroups();
        setOverlapGroups(processedGroups);
    }, [processOverlapGroups, recordings]);

    useEffect(() => {
        localStorage.setItem('recordings', JSON.stringify(recordings));
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
    }, [recordings, overlapGroups]);

    const contextValue = useMemo(
        () => ({
            overlapGroups,
            recordings,
            setOverlapGroups,
            setRecordings,
        }),
        [overlapGroups, recordings]
    );

    return (
        <InstrumentRecordingsContext.Provider value={contextValue}>
            {children}
        </InstrumentRecordingsContext.Provider>
    );
};

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default InstrumentRecordingsProvider;

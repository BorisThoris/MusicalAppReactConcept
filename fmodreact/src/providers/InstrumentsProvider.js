import PropTypes from 'prop-types';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

const isOverlapping = (event1, event2) =>
    event1.startTime < event2.endTime && event2.startTime < event1.endTime;

const isGroupOverlapping = (group1, group2) =>
    group1.startTime < group2.endTime && group2.startTime < group1.endTime;

const groupOverlappingSounds = (instrumentGroup) => {
    let overlapGroups = [];
    const visited = new Set();

    // Initial grouping of overlapping events
    instrumentGroup.forEach((event, i) => {
        if (!visited.has(i)) {
            const group = {
                endTime: event.endTime,
                events: [event],
                id: event.id, // Initialize the id with the first event's id
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
                    group.id += otherEvent.id; // Concatenate the ids
                    visited.add(j);
                }
            });

            overlapGroups.push(group);
        }
    });

    let merged = true;
    while (merged) {
        merged = false;
        const newOverlapGroups = [];

        // eslint-disable-next-line no-loop-func
        overlapGroups.forEach((group) => {
            const mergedGroup = newOverlapGroups.find((existingGroup) =>
                isGroupOverlapping(group, existingGroup)
            );
            if (mergedGroup) {
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
                mergedGroup.id += group.id; // Concatenate ids for merged groups
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

    // Function to process overlap groups
    const processOverlapGroups = useCallback(() => {
        const newOverlapGroups = {};
        Object.keys(recordings).forEach((instrument) => {
            newOverlapGroups[instrument] = groupOverlappingSounds(
                recordings[instrument]
            );
        });

        return newOverlapGroups;
    }, [recordings]);

    // useEffect to trigger processing when recordings change
    useEffect(() => {
        const processedGroups = processOverlapGroups();
        setOverlapGroups(processedGroups);
    }, [processOverlapGroups, recordings]);

    const contextValue = useMemo(
        () => ({
            overlapGroups,
            recordings,
            setRecordings,
        }),
        [recordings, overlapGroups]
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

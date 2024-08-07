import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { recreateEvents } from '../globalHelpers/createSound';
import { useOverlapCalculator } from '../hooks/useOverlapCalculator/useOverlapCalculator';
import { PanelContext } from '../hooks/usePanelState';

export const INSTRUMENT_NAMES = { Drum: '🥁', Guitar: '�', Piano: '🎹', Tambourine: '🎵' };

function findDifferences(obj1, obj2, parentKey = '') {
    if (obj1 === obj2) return;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        console.log(`Difference at ${parentKey}:`, obj1, obj2);
        return;
    }

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    // eslint-disable-next-line no-restricted-syntax
    for (const key of allKeys) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        findDifferences(obj1[key], obj2[key], newKey);
    }
}

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () => useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = React.memo(({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [selectedBeat, setSelectedBeat] = useState(null);
    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(overlapGroups, overlapGroups);
    const { openLoadPanel } = useContext(PanelContext);

    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [hasChanged, setHasChanged] = useState(false);
    const [initialEventCounts, setInitialEventCounts] = useState({});
    const [initialEventTimes, setInitialEventTimes] = useState({});

    const prevOverlapGroupsRef = useRef({});
    const recalculationsDisabledRef = useRef(false);

    const cleanUpMalformedEventGroups = (groups) => {
        const cleanedGroups = { ...groups };

        Object.values(cleanedGroups).forEach((instrumentData) => {
            Object.keys(instrumentData).forEach((key) => {
                const group = instrumentData[key];

                if (group.events) {
                    const events = Object.values(group.events).filter((event) => Object.keys(event).length !== 0);

                    if (events.length === 0) {
                        // eslint-disable-next-line no-param-reassign
                        delete instrumentData[key];
                    } else {
                        // eslint-disable-next-line no-param-reassign
                        instrumentData[key].events = events.reduce((acc, event) => {
                            acc[event.id] = event;
                            return acc;
                        }, {});
                    }
                }
            });
        });

        return cleanedGroups;
    };

    const pushToHistory = useCallback((currentOverlapGroups) => {
        setHistory((prevHistory) => [...prevHistory, recreateEvents(cloneDeep(currentOverlapGroups))]);
        setRedoHistory([]);
    }, []);

    const calculateAndSetOverlapGroups = useCallback(
        (recordings) => {
            if (Object.values(overlapGroups).length === 0 || recalculationsDisabledRef.current) return;

            const newOverlapGroups = calculateOverlapsForAllInstruments(recordings);
            const isOverlapGroupsChanged =
                JSON.stringify(newOverlapGroups) !== JSON.stringify(prevOverlapGroupsRef.current);

            if (isOverlapGroupsChanged) {
                findDifferences(newOverlapGroups, prevOverlapGroupsRef.current);

                pushToHistory(prevOverlapGroupsRef.current);
                const cleanedUpGroups = cleanUpMalformedEventGroups(newOverlapGroups);

                prevOverlapGroupsRef.current = cloneDeep(cleanedUpGroups);

                setOverlapGroups(cleanedUpGroups);
                return true;
            }

            return false;
        },
        [calculateOverlapsForAllInstruments, overlapGroups, pushToHistory]
    );

    const countNamedEvents = useCallback((groups) => {
        const counts = {};
        Object.entries(groups).forEach(([instrumentName, instrumentData]) => {
            counts[instrumentName] = Object.values(instrumentData).reduce((sum, group) => {
                if (group.events) {
                    // eslint-disable-next-line no-param-reassign
                    sum += Object.keys(group.events).length;
                }
                return sum;
            }, 0);
        });
        return counts;
    }, []);

    const extractEventTimes = useCallback((groups) => {
        const times = {};
        Object.entries(groups).forEach(([instrumentName, instrumentData]) => {
            times[instrumentName] = Object.values(instrumentData).reduce((acc, group) => {
                if (group.events) {
                    Object.values(group.events).forEach((event) => {
                        acc[event.id] = { endTime: event.endTime, startTime: event.startTime };
                    });
                }
                return acc;
            }, {});
        });
        return times;
    }, []);

    const updateCurrentBeat = useCallback(() => {
        if (selectedBeat && selectedBeat.name) {
            const updatedBeat = {
                ...selectedBeat,
                data: overlapGroups,
                date: new Date().toLocaleString()
            };
            const savedBeats = JSON.parse(localStorage.getItem('beats')) || [];
            const updatedBeats = savedBeats.map((beat) => (beat.name === updatedBeat.name ? updatedBeat : beat));
            localStorage.setItem('beats', JSON.stringify(updatedBeats));
            alert('Beat updated successfully.');

            // Refresh the tracking states
            setInitialEventCounts(countNamedEvents(overlapGroups));
            setInitialEventTimes(extractEventTimes(overlapGroups));
            setHasChanged(false);
        } else {
            alert('No beat selected to update.');
        }
    }, [selectedBeat, overlapGroups, countNamedEvents, extractEventTimes]);

    useEffect(() => {
        if (!recalculationsDisabledRef.current) {
            calculateAndSetOverlapGroups(overlapGroups);
        } else {
            recalculationsDisabledRef.current = false;
        }

        const currentEventCounts = countNamedEvents(overlapGroups);
        const hasEventCountsChanged = Object.keys(initialEventCounts).some(
            (key) => initialEventCounts[key] !== currentEventCounts[key]
        );

        const currentEventTimes = extractEventTimes(overlapGroups);

        const getSortedEventTimes = (events) =>
            Object.values(events)
                .map(({ endTime, startTime }) => ({ endTime, startTime }))
                .sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime);

        const haveEventTimesChanged = (current, initial) => {
            const currentInstruments = Object.keys(current);
            const initialInstruments = Object.keys(initial);

            if (currentInstruments.length !== initialInstruments.length) return true;

            return currentInstruments.some((instrument) => {
                if (!initial[instrument]) return true;
                const currentSorted = getSortedEventTimes(current[instrument]);
                const initialSorted = getSortedEventTimes(initial[instrument]);

                if (currentSorted.length !== initialSorted.length) return true;

                return currentSorted.some(
                    (time, i) =>
                        time.startTime !== initialSorted[i].startTime || time.endTime !== initialSorted[i].endTime
                );
            });
        };

        const hasEventTimesChanged = haveEventTimesChanged(currentEventTimes, initialEventTimes);

        setHasChanged(hasEventCountsChanged || hasEventTimesChanged);
    }, [
        overlapGroups,
        calculateAndSetOverlapGroups,
        history,
        selectedBeat,
        initialEventCounts,
        initialEventTimes,
        countNamedEvents,
        extractEventTimes
    ]);

    useEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openLoadPanel();

            prevOverlapGroupsRef.current = cloneDeep(overlapGroups);
        }
    }, [openLoadPanel, overlapGroups]);

    const undo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory;

            recalculationsDisabledRef.current = true;

            const newHistory = prevHistory.slice(0, -1);
            const newState = recreateEvents(cloneDeep(prevHistory[prevHistory.length - 1]));

            setRedoHistory((prevRedoHistory) => [...prevRedoHistory, cloneDeep(overlapGroups)]);
            setOverlapGroups(newState);

            prevOverlapGroupsRef.current = cloneDeep(newState);

            return newHistory;
        });
    }, [overlapGroups]);

    const redo = useCallback(() => {
        setRedoHistory((prevRedoHistory) => {
            if (prevRedoHistory.length === 0) return prevRedoHistory;

            recalculationsDisabledRef.current = true;

            const newRedoHistory = prevRedoHistory.slice(0, -1);
            const newState = recreateEvents(cloneDeep(prevRedoHistory[prevRedoHistory.length - 1]));

            setHistory((prevHistory) => [...prevHistory, cloneDeep(overlapGroups)]);
            setOverlapGroups(newState);

            prevOverlapGroupsRef.current = cloneDeep(newState);

            recalculationsDisabledRef.current = false;

            return newRedoHistory;
        });
    }, [overlapGroups]);

    useEffect(() => {
        // Set the initial event counts and times on first render
        if (Object.keys(initialEventCounts).length === 0 && Object.keys(overlapGroups).length > 0) {
            setInitialEventCounts(countNamedEvents(overlapGroups));
            setInitialEventTimes(extractEventTimes(overlapGroups));
        }
    }, [overlapGroups, initialEventCounts, initialEventTimes, countNamedEvents, extractEventTimes]);

    const handleOverlapGroupsChange = useCallback((newOverlapGroups) => {
        setOverlapGroups(newOverlapGroups);
    }, []);

    const flatOverlapGroups = useMemo(() => {
        const flattenEvents = (group) => {
            const flatEvents = {};

            Object.values(group).forEach((value) => {
                flatEvents[value.id] = value;

                const events = Object.values(value.events);
                events.forEach((nestedEvent) => {
                    if (nestedEvent.id && nestedEvent.id !== value.id) {
                        flatEvents[nestedEvent.id] = nestedEvent;
                    }
                });
            });

            return flatEvents;
        };

        const allFlatEvents = {};

        Object.values(overlapGroups).forEach((group) => {
            Object.assign(allFlatEvents, flattenEvents(group));
        });

        return allFlatEvents;
    }, [overlapGroups]);

    const contextValue = useMemo(
        () => ({
            calculateAndSetOverlapGroups,
            calculateOverlapsForAllInstruments,
            cleanUpMalformedEventGroups,
            flatOverlapGroups,
            hasChanged,
            history,
            overlapGroups,
            prevOverlapGroupsRef,
            pushToHistory,
            recordings: overlapGroups,
            redo,
            redoHistory,
            selectedBeat,
            setHasChanged,
            setOverlapGroups: handleOverlapGroupsChange,
            setSelectedBeat,
            undo,
            updateCurrentBeat
        }),
        [
            calculateAndSetOverlapGroups,
            calculateOverlapsForAllInstruments,
            flatOverlapGroups,
            hasChanged,
            history,
            overlapGroups,
            pushToHistory,
            redo,
            redoHistory,
            selectedBeat,
            handleOverlapGroupsChange,
            undo,
            updateCurrentBeat
        ]
    );

    return <InstrumentRecordingsContext.Provider value={contextValue}>{children}</InstrumentRecordingsContext.Provider>;
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default InstrumentRecordingsProvider;

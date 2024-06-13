/* eslint-disable no-restricted-syntax */
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { recreateEvents } from '../globalHelpers/createSound';
import useOverlapCalculator from '../hooks/useOverlapCalculator/useOverlapCalculator';

export const INSTRUMENT_NAMES = { Drum: '🥁', Guitar: '�', Piano: '🎹', Tambourine: '🎵' };

function findDifferences(obj1, obj2, parentKey = '') {
    if (obj1 === obj2) return;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        console.log(`Difference at ${parentKey}:`, obj1, obj2);
        return;
    }

    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of allKeys) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        findDifferences(obj1[key], obj2[key], newKey);
    }
}

export const InstrumentRecordingsContext = createContext();

export const useInstrumentRecordings = () => useContext(InstrumentRecordingsContext);

export const InstrumentRecordingsProvider = React.memo(({ children }) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(overlapGroups, overlapGroups);

    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);

    const [localLoaded, setLocalLoaded] = useState(false);
    const prevOverlapGroupsRef = useRef({});

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

    useEffect(() => {
        if (!localLoaded) return;

        let newOverlapGroups = calculateOverlapsForAllInstruments();

        const isOverlapGroupsChanged =
            JSON.stringify(newOverlapGroups) !== JSON.stringify(prevOverlapGroupsRef.current);
        if (isOverlapGroupsChanged) {
            findDifferences(newOverlapGroups, prevOverlapGroupsRef.current);

            newOverlapGroups = cleanUpMalformedEventGroups(newOverlapGroups);

            setOverlapGroups(newOverlapGroups);
            prevOverlapGroupsRef.current = cloneDeep(newOverlapGroups);
        }
    }, [calculateOverlapsForAllInstruments, localLoaded, overlapGroups]);

    // Second, use a separate effect to synchronize prevOverlapGroupsRef
    useEffect(() => {
        if (localLoaded) {
            prevOverlapGroupsRef.current = cloneDeep(overlapGroups);
        }
    }, [overlapGroups, localLoaded]);

    useEffect(() => {
        if (!localLoaded) {
            const savedData = localStorage.getItem('overlapGroups');
            if (savedData) {
                let savedOverlapGroups = JSON.parse(savedData);

                savedOverlapGroups = recreateEvents(savedOverlapGroups);
                setOverlapGroups(savedOverlapGroups);
            }
            setLocalLoaded(true);
        }
    }, [localLoaded, calculateOverlapsForAllInstruments]);

    useEffect(() => {
        if (localLoaded) {
            const currentSavedStr = localStorage.getItem('overlapGroups');
            const currentOverlapGroupsStr = JSON.stringify(overlapGroups);

            if (currentSavedStr !== currentOverlapGroupsStr) {
                localStorage.setItem('overlapGroups', currentOverlapGroupsStr);
            }
        }
    }, [overlapGroups, localLoaded]);

    const pushToHistory = useCallback((currentOverlapGroups) => {
        setHistory((prevHistory) => [...prevHistory, cloneDeep(currentOverlapGroups)]);
        setRedoHistory([]);
    }, []);

    const undo = useCallback(() => {
        if (history.length === 0) return;
        const newState = cloneDeep(history[history.length - 1]);

        setOverlapGroups(recreateEvents(newState));

        setHistory(history.slice(0, -1));
        setRedoHistory((prevRedoHistory) => [...prevRedoHistory, cloneDeep(overlapGroups)]);
    }, [history, overlapGroups]);

    const redo = useCallback(() => {
        if (redoHistory.length === 0) return;
        const newState = cloneDeep(redoHistory[redoHistory.length - 1]);

        setOverlapGroups(recreateEvents(newState));
        setRedoHistory(redoHistory.slice(0, -1));
        setHistory((prevHistory) => [...prevHistory, cloneDeep(newState)]);
    }, [redoHistory]);

    const setOverlapGroupsAndClearRedo = useCallback(
        (newOverlapGroups) => {
            pushToHistory(overlapGroups);
            setOverlapGroups(newOverlapGroups);
            setRedoHistory([]);
        },
        [overlapGroups, pushToHistory]
    );

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
            flatOverlapGroups,
            history,
            overlapGroups,
            recordings: overlapGroups,
            redo,
            redoHistory,
            setOverlapGroups: setOverlapGroupsAndClearRedo,
            undo
        }),
        [flatOverlapGroups, history, overlapGroups, redo, redoHistory, setOverlapGroupsAndClearRedo, undo]
    );

    return <InstrumentRecordingsContext.Provider value={contextValue}>{children}</InstrumentRecordingsContext.Provider>;
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default InstrumentRecordingsProvider;

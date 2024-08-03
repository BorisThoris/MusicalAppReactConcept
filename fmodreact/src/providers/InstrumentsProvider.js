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
    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(overlapGroups, overlapGroups);
    const { openSavePanel } = useContext(PanelContext);

    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);

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

    useEffect(() => {
        if (!recalculationsDisabledRef.current) {
            calculateAndSetOverlapGroups(overlapGroups);
        } else {
            recalculationsDisabledRef.current = false;
        }
    }, [overlapGroups, calculateOverlapsForAllInstruments, calculateAndSetOverlapGroups, history]);

    useEffect(() => {
        if (Object.values(overlapGroups).length === 0) {
            openSavePanel();

            prevOverlapGroupsRef.current = cloneDeep(overlapGroups);
        }
    }, [overlapGroups, openSavePanel]);

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
            history,
            overlapGroups,
            prevOverlapGroupsRef,
            pushToHistory,
            recordings: overlapGroups,
            redo,
            redoHistory,
            setOverlapGroups,
            undo
        }),
        [
            calculateAndSetOverlapGroups,
            calculateOverlapsForAllInstruments,
            flatOverlapGroups,
            history,
            overlapGroups,
            pushToHistory,
            redo,
            redoHistory,
            undo
        ]
    );

    return <InstrumentRecordingsContext.Provider value={contextValue}>{children}</InstrumentRecordingsContext.Provider>;
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default InstrumentRecordingsProvider;

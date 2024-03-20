/* eslint-disable no-restricted-syntax */
import cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { recreateEvents } from '../globalHelpers/createSound';
import useOverlapCalculator from '../hooks/useOverlapCalculator/useOverlapCalculator';

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
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);

    const prevOverlapGroupsRef = useRef({});

    const [localLoaded, setLocalLoaded] = useState(false);

    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(overlapGroups, overlapGroups);

    useEffect(() => {
        const newOverlapGroups = calculateOverlapsForAllInstruments();

        const isOverlapGroupsChanged =
            JSON.stringify(newOverlapGroups) !== JSON.stringify(prevOverlapGroupsRef.current);

        if (isOverlapGroupsChanged) {
            setOverlapGroups(newOverlapGroups);
            findDifferences(newOverlapGroups, prevOverlapGroupsRef.current);

            prevOverlapGroupsRef.current = cloneDeep(newOverlapGroups);
        }
    }, [calculateOverlapsForAllInstruments]);

    useEffect(() => {
        const savedOverlapGroups = JSON.parse(localStorage.getItem('overlapGroups'));

        if (savedOverlapGroups) {
            try {
                const parsedOverlapGroups = savedOverlapGroups;
                setOverlapGroups(parsedOverlapGroups);
            } catch (e) {
                alert('Failed to parse overlapGroups from localStorage', e);
            }
        }
    }, []);

    useEffect(() => {
        if (!localLoaded && Object.keys(overlapGroups).length > 0) {
            if (overlapGroups) {
                setOverlapGroups(recreateEvents(overlapGroups));
            }
            setLocalLoaded(true);
        }
    }, [localLoaded, overlapGroups]);

    useEffect(() => {
        localStorage.setItem('overlapGroups', JSON.stringify(overlapGroups));
    }, [overlapGroups]);

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

    const contextValue = useMemo(
        () => ({
            history,
            overlapGroups,
            overlapGroupsValues: [...Object.values(overlapGroups)],
            recordings: overlapGroups,
            redo,
            redoHistory,
            setOverlapGroups: setOverlapGroupsAndClearRedo,
            undo
        }),
        [history, overlapGroups, redo, redoHistory, setOverlapGroupsAndClearRedo, undo]
    );

    return <InstrumentRecordingsContext.Provider value={contextValue}>{children}</InstrumentRecordingsContext.Provider>;
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default InstrumentRecordingsProvider;

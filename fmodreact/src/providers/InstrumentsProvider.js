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

    console.log(overlapGroups);

    const prevOverlapGroupsRef = useRef({});

    const [localLoaded, setLocalLoaded] = useState(false);

    const { calculateOverlapsForAllInstruments } = useOverlapCalculator(overlapGroups, overlapGroups);

    useEffect(() => {
        if (!localLoaded) return;

        const newOverlapGroups = calculateOverlapsForAllInstruments();

        const isOverlapGroupsChanged =
            JSON.stringify(newOverlapGroups) !== JSON.stringify(prevOverlapGroupsRef.current);
        if (isOverlapGroupsChanged) {
            // findDifferences(newOverlapGroups, prevOverlapGroupsRef.current);
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
        // This effect is responsible for setting the initial state from localStorage
        // and should run exactly once on component mount.
        if (!localLoaded) {
            const savedData = localStorage.getItem('overlapGroups');
            if (savedData) {
                let savedOverlapGroups = JSON.parse(savedData);

                savedOverlapGroups = recreateEvents(savedOverlapGroups);

                // Calculate overlaps for all instruments if necessary right after loading
                // Assumption: calculateOverlapsForAllInstruments can directly accept and process the savedOverlapGroups
                setOverlapGroups(savedOverlapGroups);
            }
            setLocalLoaded(true);
        }
    }, [localLoaded, calculateOverlapsForAllInstruments]);

    useEffect(() => {
        if (localLoaded) {
            const currentSavedStr = localStorage.getItem('overlapGroups');
            const currentOverlapGroupsStr = JSON.stringify(overlapGroups);

            // Compare the stringified current state with what's saved in localStorage
            if (currentSavedStr !== currentOverlapGroupsStr) {
                localStorage.setItem('overlapGroups', currentOverlapGroupsStr); // Proceed with saving only if they differ
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
        // This function traverses through the groups and their nested events recursively
        const flattenEvents = (group) => {
            const flatEvents = {};

            // Iterate over each event in the group
            Object.entries(group).forEach(([key, value]) => {
                if (value.id) {
                    // Store the event by its id after removing nested 'events' to avoid duplication
                    flatEvents[value.id] = { ...value };
                }
            });

            return flatEvents;
        };

        const allFlatEvents = {};

        Object.values(overlapGroups).forEach((group) => {
            // Flatten events for each group of instruments and merge them into the main accumulator
            Object.assign(allFlatEvents, flattenEvents(group));
        });

        return allFlatEvents;
    }, [overlapGroups]);

    const updateOverlapGroup = useCallback(
        (groupId, updates) => {
            // Find the group in flatOverlapGroups
            const flatGroup = flatOverlapGroups[groupId];
            if (!flatGroup) {
                console.error('Group not found');
                return;
            }

            Object.assign(flatGroup, updates);

            Object.keys(overlapGroups).forEach((key) => {
                overlapGroups[key].forEach((group) => {
                    if (group.id === groupId) {
                        Object.assign(group, updates);
                    }
                });
            });

            pushToHistory(overlapGroups);

            setOverlapGroups(overlapGroups);
        },
        [flatOverlapGroups, overlapGroups, pushToHistory]
    );

    const contextValue = useMemo(
        () => ({
            flatOverlapGroups,
            history,
            overlapGroups,
            recordings: overlapGroups,
            redo,
            redoHistory,
            setOverlapGroups: setOverlapGroupsAndClearRedo,
            undo,
            updateOverlapGroup
        }),
        [
            flatOverlapGroups,
            history,
            overlapGroups,
            redo,
            redoHistory,
            setOverlapGroupsAndClearRedo,
            undo,
            updateOverlapGroup
        ]
    );

    return <InstrumentRecordingsContext.Provider value={contextValue}>{children}</InstrumentRecordingsContext.Provider>;
});

InstrumentRecordingsProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default InstrumentRecordingsProvider;

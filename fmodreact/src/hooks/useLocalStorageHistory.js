import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useEffect, useRef, useState } from 'react';
import { recreateEvents } from '../globalHelpers/createSound';

export const useLocalStorageHistory = (calculateOverlapsForAllInstruments, cleanUpMalformedEventGroups) => {
    const [overlapGroups, setOverlapGroups] = useState({});
    const [localLoaded, setLocalLoaded] = useState(false);
    const prevOverlapGroupsRef = useRef({});

    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);

    useEffect(() => {
        if (!localLoaded) return;

        let newOverlapGroups = calculateOverlapsForAllInstruments();

        const isOverlapGroupsChanged =
            JSON.stringify(newOverlapGroups) !== JSON.stringify(prevOverlapGroupsRef.current);
        if (isOverlapGroupsChanged) {
            newOverlapGroups = cleanUpMalformedEventGroups(newOverlapGroups);

            setOverlapGroups(newOverlapGroups);
            prevOverlapGroupsRef.current = cloneDeep(newOverlapGroups);
        }
    }, [calculateOverlapsForAllInstruments, cleanUpMalformedEventGroups, localLoaded, overlapGroups]);

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
    }, [localLoaded]);

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

    return {
        history,
        localLoaded,
        overlapGroups,
        redo,
        redoHistory,
        setOverlapGroups: setOverlapGroupsAndClearRedo,
        undo
    };
};

export default useLocalStorageHistory;

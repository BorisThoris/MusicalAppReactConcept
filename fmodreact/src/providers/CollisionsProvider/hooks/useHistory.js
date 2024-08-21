import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useRef, useState } from 'react';
import { recreateEvents } from '../../../globalHelpers/createSound';

export const useHistory = ({ calculateOverlapsForAllInstruments, overlapGroups, setOverlapGroups }) => {
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const recalculationsDisabledRef = useRef(false);

    const pushToHistory = useCallback((currentOverlapGroups) => {
        setHistory((prevHistory) => [...prevHistory, recreateEvents(cloneDeep(currentOverlapGroups))]);
        setRedoHistory([]);
    }, []);

    const undo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory; // No history to undo

            recalculationsDisabledRef.current = true;

            const newHistory = prevHistory.slice(0, -1);
            const previousState = prevHistory[prevHistory.length - 1];

            // Clone the previous state and recalculate overlaps
            const updatedGroups = calculateOverlapsForAllInstruments(recreateEvents(cloneDeep(previousState)));
            setRedoHistory((prevRedoHistory) => [cloneDeep(overlapGroups), ...prevRedoHistory]);
            setOverlapGroups(updatedGroups);

            recalculationsDisabledRef.current = false;

            return newHistory;
        });
    }, [overlapGroups, setOverlapGroups, calculateOverlapsForAllInstruments]);

    const redo = useCallback(() => {
        setRedoHistory((prevRedoHistory) => {
            if (prevRedoHistory.length === 0) return prevRedoHistory; // No redo history

            recalculationsDisabledRef.current = true;

            const nextState = prevRedoHistory[0];
            const newRedoHistory = prevRedoHistory.slice(1);

            // Clone the next state and recalculate overlaps
            const updatedGroups = calculateOverlapsForAllInstruments(recreateEvents(cloneDeep(nextState)));
            setHistory((prevHistory) => [...prevHistory, cloneDeep(overlapGroups)]);
            setOverlapGroups(updatedGroups);

            recalculationsDisabledRef.current = false;

            return newRedoHistory;
        });
    }, [overlapGroups, setOverlapGroups, calculateOverlapsForAllInstruments]);

    return {
        history,
        pushToHistory,
        redo,
        redoHistory,
        undo
    };
};

export default useHistory;

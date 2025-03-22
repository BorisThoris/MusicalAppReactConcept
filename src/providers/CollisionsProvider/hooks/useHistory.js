import { useCallback, useRef, useState } from 'react';
import { recreateEvents } from '../../../globalHelpers/createSound';

export const useHistory = ({ calculateOverlapsForAllInstruments, overlapGroups, setOverlapGroups }) => {
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const recalculationsDisabledRef = useRef(false);

    const pushToHistory = useCallback((currentOverlapGroups) => {
        // Use spread operator to create a shallow copy of currentOverlapGroups
        setHistory((prevHistory) => [...prevHistory, recreateEvents([...currentOverlapGroups])]);
        setRedoHistory([]);
    }, []);

    const undo = useCallback(() => {
        setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory; // No history to undo

            recalculationsDisabledRef.current = true;

            const newHistory = prevHistory.slice(0, -1);
            const previousState = prevHistory[prevHistory.length - 1];

            // Use shallow copy for the previous state
            const updatedGroups = calculateOverlapsForAllInstruments(recreateEvents([...previousState]));
            // Create a shallow copy of overlapGroups when storing in redoHistory
            setRedoHistory((prevRedoHistory) => [[...overlapGroups], ...prevRedoHistory]);
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

            // Use shallow copy for the next state
            const updatedGroups = calculateOverlapsForAllInstruments(recreateEvents([...nextState]));
            // When adding to history, spread overlapGroups to shallow copy it
            setHistory((prevHistory) => [...prevHistory, [...overlapGroups]]);
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

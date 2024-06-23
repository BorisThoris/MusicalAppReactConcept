import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useState } from 'react';

export const useHistory = (initialState) => {
    const [history, setHistory] = useState([]);
    const [redoHistory, setRedoHistory] = useState([]);
    const [currentState, setCurrentState] = useState(initialState);

    const pushToHistory = useCallback(
        (newState) => {
            setHistory((prevHistory) => [...prevHistory, cloneDeep(currentState)]);
            setRedoHistory([]);
            setCurrentState(newState);
        },
        [currentState]
    );

    const undo = useCallback(() => {
        if (history.length === 0) return;
        const previousState = cloneDeep(history[history.length - 1]);
        setHistory(history.slice(0, -1));
        setRedoHistory((prevRedoHistory) => [...prevRedoHistory, cloneDeep(currentState)]);
        setCurrentState(previousState);
    }, [history, currentState]);

    const redo = useCallback(() => {
        if (redoHistory.length === 0) return;
        const nextState = cloneDeep(redoHistory[redoHistory.length - 1]);
        setRedoHistory(redoHistory.slice(0, -1));
        setHistory((prevHistory) => [...prevHistory, cloneDeep(currentState)]);
        setCurrentState(nextState);
    }, [redoHistory, currentState]);

    return {
        currentState,
        history,
        redo,
        redoHistory,
        setCurrentState: pushToHistory,
        undo
    };
};

export default useHistory;

import React, { createContext, useContext } from 'react';
import { useHistory } from './CollisionsProvider/hooks/useHistory';

const HistoryContext = createContext();

export const useHistoryContext = () => {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistoryContext must be used within a HistoryProvider');
    }
    return context;
};

export const HistoryProvider = ({ children }) => {
    // These will be provided by other providers
    const { overlapGroups, setOverlapGroups } = useContext(require('./OverlapProvider').OverlapContext) || {};
    const { processBeat } = useContext(require('./OverlapProvider').OverlapContext) || {};
    const { stageRef } = useContext(require('./TimelineRefsProvider').TimelineRefsContext) || {};

    const { history, pushToHistory, redo, redoHistory, undo } = useHistory({
        calculateOverlapsForAllInstruments: processBeat || (() => {}),
        overlapGroups: overlapGroups || {},
        setOverlapGroups: setOverlapGroups || (() => {})
    });

    const value = {
        history,
        pushToHistory,
        redo,
        redoHistory,
        undo
    };

    return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

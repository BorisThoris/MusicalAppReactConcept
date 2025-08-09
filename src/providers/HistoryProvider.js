import React, { createContext, useContext, useMemo } from 'react';
import { useHistory } from './CollisionsProvider/hooks/useHistory';
import { OverlapContext } from './OverlapProvider';
import { TimelineRefsContext } from './TimelineRefsProvider';

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
    const { overlapGroups, setOverlapGroups } = useContext(OverlapContext) || {};
    const { processBeat } = useContext(OverlapContext) || {};
    const { stageRef } = useContext(TimelineRefsContext) || {};

    const { canRedo, canUndo, redo, undo } = useHistory({
        overlapGroups,
        processBeat,
        setOverlapGroups,
        stageRef
    });

    const contextValue = useMemo(
        () => ({
            canRedo,
            canUndo,
            redo,
            undo
        }),
        [canRedo, canUndo, redo, undo]
    );

    return <HistoryContext.Provider value={contextValue}>{children}</HistoryContext.Provider>;
};

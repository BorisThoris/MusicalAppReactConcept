import React, { useCallback, useContext, useMemo } from 'react';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';

export const HistoryControls = () => {
    const { history, redo, undo } = useContext(CollisionsContext);

    const handleUndo = useCallback(() => {
        undo();
    }, [undo]);

    const handleRedo = useCallback(() => {
        redo();
    }, [redo]);

    // Memoize the container style to avoid creating new objects on every render
    const containerStyle = useMemo(() => ({ display: 'inline-flex' }), []);

    return (
        <div style={containerStyle}>
            <button onClick={handleUndo} disabled={!history.length}>
                Undo
            </button>
            <button onClick={handleRedo} disabled={!history.length}>
                Redo
            </button>
        </div>
    );
};

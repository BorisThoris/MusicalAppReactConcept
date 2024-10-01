import React, { useContext } from 'react';
import { CollisionsContext } from '../../../../providers/CollisionsProvider/CollisionsProvider';

export const HistoryControls = () => {
    const { history, redo, redoHistory, undo } = useContext(CollisionsContext);

    return (
        <div style={{ display: 'inline-flex' }}>
            {history?.length > 0 && <button onClick={undo}>Undo</button>}
            {redoHistory?.length > 0 && <button onClick={redo}>Redo</button>}
        </div>
    );
};

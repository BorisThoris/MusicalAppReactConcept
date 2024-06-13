import React, { useContext } from 'react';
import { InstrumentRecordingsContext } from '../../../../providers/InstrumentsProvider';

export const HistoryControls = () => {
    const { history, redo, redoHistory, undo } = useContext(InstrumentRecordingsContext);

    return (
        <div style={{ display: 'inline-flex' }}>
            {history.length > 0 && <button onClick={undo}>Undo</button>}
            {redoHistory.length > 0 && <button onClick={redo}>Redo</button>}
        </div>
    );
};

export default HistoryControls;

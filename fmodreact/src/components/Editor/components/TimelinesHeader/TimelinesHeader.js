import React, { useContext } from 'react';
import { useAddInstrumentLayer } from '../../../../hooks/useAddInstrumentLayer';
import { PanelContext } from '../../../../hooks/usePanelState';
import { HistoryControls } from '../HistoryControls/HistoryButtons';
import { PlaybackControls } from '../PlaybackControls/PlaybackControls';

export const TimelinesHeader = () => {
    const { onAddLayer } = useAddInstrumentLayer();
    const { openSavePanel } = useContext(PanelContext);

    return (
        <>
            <button onClick={openSavePanel}>💾</button>

            <PlaybackControls />
            <HistoryControls />

            <button onClick={onAddLayer}>Add Instrument Layer</button>
        </>
    );
};

export default TimelinesHeader;

import React, { useCallback, useContext } from 'react';
import { PanelContext } from './usePanelState';

export const useAddInstrumentLayer = () => {
    const { openInstrumentLayerPanel } = useContext(PanelContext);

    const onAddLayer = useCallback(() => {
        openInstrumentLayerPanel();
    }, [openInstrumentLayerPanel]);

    return {
        onAddLayer
    };
};

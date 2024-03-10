import { useCallback, useContext, useEffect, useRef } from 'react';
import { INSTRUMENTS_PANEL_ID, PanelContext, PARAMS_PANEL_ID } from './usePanelState';

export const useInstrumentPanel = (parentGroupName, timelineY, cursorPos, timelineState) => {
    const { closePanel, closeParamsPanel, openPanel, panels } = useContext(PanelContext);
    const openInstrumentPanelTimeoutRef = useRef();

    const openInstrumentPanel = useCallback(() => {
        // Close the parameters panel if it's open
        if (panels[PARAMS_PANEL_ID]) {
            closeParamsPanel();
        }

        // Open the instrument panel
        openPanel({
            id: INSTRUMENTS_PANEL_ID,
            instrumentLayer: parentGroupName,
            x: cursorPos.screenX,
            y: timelineY + timelineState.canvasOffsetY + 200 // Assuming TimelineHeight is 200 as per the given code
        });
    }, [
        closeParamsPanel,
        cursorPos.screenX,
        openPanel,
        parentGroupName,
        panels,
        timelineState.canvasOffsetY,
        timelineY
    ]);

    const closeInstrumentPanel = useCallback(() => {
        if (panels[INSTRUMENTS_PANEL_ID]) {
            closePanel(INSTRUMENTS_PANEL_ID);
        }
    }, [closePanel, panels]);

    const setupDelayedOpen = useCallback(
        (callBack, delay = 300) => {
            clearTimeout(openInstrumentPanelTimeoutRef.current);
            openInstrumentPanelTimeoutRef.current = setTimeout(() => {
                openInstrumentPanel();
                callBack();
            }, delay);
        },
        [openInstrumentPanel]
    );

    const cancelDelayedOpen = useCallback(() => {
        clearTimeout(openInstrumentPanelTimeoutRef.current);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimeout(openInstrumentPanelTimeoutRef.current);
    }, []);

    return {
        cancelDelayedOpen,
        closeInstrumentPanel,
        openInstrumentPanel,
        setupDelayedOpen
    };
};

export default useInstrumentPanel;

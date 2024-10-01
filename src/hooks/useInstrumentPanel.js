import { useCallback, useContext, useEffect, useRef } from 'react';
import { useCustomCursorContext } from '../providers/CursorProvider';
import { INSTRUMENTS_PANEL_ID, PanelContext } from './usePanelState';

export const useInstrumentPanel = (parentGroupName, timelineY, timelineState) => {
    const { cursorPos } = useCustomCursorContext();

    const { closePanel, openPanel, panels } = useContext(PanelContext);
    const openInstrumentPanelTimeoutRef = useRef();

    const openInstrumentPanel = useCallback(() => {
        openPanel({
            id: INSTRUMENTS_PANEL_ID,
            instrumentLayer: parentGroupName,
            x: cursorPos.screenX,
            y: timelineY + timelineState.canvasOffsetY + 200
        });
    }, [cursorPos.screenX, openPanel, parentGroupName, timelineState.canvasOffsetY, timelineY]);

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

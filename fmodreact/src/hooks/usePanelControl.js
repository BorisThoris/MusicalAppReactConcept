import { useEffect } from 'react';
import { SELECTIONS_PANEL_ID } from './usePanelState';

export const usePanelControl = (selectedItems, panels, openPanel, closePanel) => {
    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const isPanelOpen = !!panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && !isPanelOpen) {
            openPanel({ id: SELECTIONS_PANEL_ID });
        } else if (!isSelectedItemsNotEmpty && isPanelOpen) {
            closePanel(SELECTIONS_PANEL_ID);
        }
    }, [closePanel, openPanel, panels, selectedItems]);
};

export default usePanelControl;

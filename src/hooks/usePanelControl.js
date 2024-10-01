import { useEffect } from 'react';
import { SELECTIONS_PANEL_ID } from './usePanelState';

export const usePanelControl = (selectedItems, panels, openSelectionsPanel, closePanel) => {
    useEffect(() => {
        const isSelectedItemsNotEmpty = Object.keys(selectedItems).length > 0;
        const isPanelOpen = !!panels[SELECTIONS_PANEL_ID];

        if (isSelectedItemsNotEmpty && !isPanelOpen) {
            openSelectionsPanel();
        } else if (!isSelectedItemsNotEmpty && isPanelOpen) {
            closePanel(SELECTIONS_PANEL_ID);
        }
    }, [closePanel, openSelectionsPanel, panels, selectedItems]);
};

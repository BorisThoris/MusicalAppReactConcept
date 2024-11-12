import { useCallback, useContext } from 'react';
import { PanelContext } from './usePanelState';

function useContextMenu() {
    const { hideActionsMenu, showActionsMenu } = useContext(PanelContext);

    const handleCloseMenu = useCallback(
        (e) => {
            e.evt.preventDefault(); // Prevent default browser context menu
            hideActionsMenu();
        },
        [hideActionsMenu]
    );

    // Function to handle right-click and show custom context menu
    // Function to handle right-click and show custom context menu
    const handleContextMenu = useCallback(
        (e, element = null) => {
            handleCloseMenu(e);
            e.evt.preventDefault(); // Prevent default browser context menu

            // Get the correct coordinates relative to the page
            const position = {
                x: e.evt.pageX,
                y: e.evt.pageY
            };

            showActionsMenu({ element, position });
        },
        [handleCloseMenu, showActionsMenu]
    );

    return { handleCloseMenu, handleContextMenu };
}

export default useContextMenu;

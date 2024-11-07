import { useCallback, useContext } from 'react';
import { useCustomCursorContext } from '../providers/CursorProvider';
import { PanelContext } from './usePanelState';

function useContextMenu() {
    const { showRightClickMenu } = useContext(PanelContext);
    const { cursorPos: mousePos } = useCustomCursorContext();

    // Function to handle right-click and show custom context menu
    const handleContextMenu = useCallback(
        (e) => {
            e.evt.preventDefault(); // Prevent default browser context menu
            showRightClickMenu({ x: mousePos.x, y: mousePos.screenY });
        },
        [mousePos, showRightClickMenu]
    );

    return { handleContextMenu };
}

export default useContextMenu;

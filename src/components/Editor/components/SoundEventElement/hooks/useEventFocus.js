import { useCallback, useContext } from 'react';
import { PanelContext } from '../../../../../hooks/usePanelState';

export const useEventFocus = (id) => {
    const { focusedEvent, setFocusedEvent } = useContext(PanelContext);
    const isFocused = id === focusedEvent;

    // When the mouse enters the element, mark it as focused.
    const handleMouseEnter = useCallback(() => setFocusedEvent(id), [id, setFocusedEvent]);

    // Restore the default z-index by setting the focused event to a default value (e.g. -1).
    const restoreZIndex = useCallback(() => setFocusedEvent(-1), [setFocusedEvent]);

    return { handleMouseEnter, isFocused, restoreZIndex };
};

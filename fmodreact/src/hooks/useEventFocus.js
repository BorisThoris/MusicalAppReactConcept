import { useCallback } from 'react';

export const useEventFocus = (focusedEvent, setFocusedEvent, id) => {
    const isFocused = id === focusedEvent;

    const handleMouseEnter = useCallback(() => setFocusedEvent(id), [id, setFocusedEvent]);
    const restoreZIndex = useCallback(() => setFocusedEvent(-1), [setFocusedEvent]);

    return { handleMouseEnter, isFocused, restoreZIndex };
};

export default useEventFocus;

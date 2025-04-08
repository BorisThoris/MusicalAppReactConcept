// hooks/useCursorEffects.js
import { useCallback } from 'react';

export function useCursorEffects() {
    // Sets the cursor style on the stage container.
    const setCursor = useCallback((e, cursorStyle) => {
        const stage = e.target.getStage?.();
        if (stage && stage.container()) {
            stage.container().style.cursor = cursorStyle;
        }
    }, []);

    // Returns a new event handler that first sets the cursor style then
    // invokes the provided callback.
    const withCursor = useCallback(
        (cursorStyle, callback) => {
            return (e) => {
                setCursor(e, cursorStyle);
                if (typeof callback === 'function') {
                    callback(e);
                }
            };
        },
        [setCursor]
    );

    return { setCursor, withCursor };
}

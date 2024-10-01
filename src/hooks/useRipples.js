import { useCallback, useState } from 'react';

export const useRipples = () => {
    const [ripples, setRipples] = useState([]);

    const addRipple = useCallback((x, y, color) => {
        setRipples((currentRipples) => [...currentRipples, { color, id: `ripple_${Date.now()}`, x, y }]);
    }, []);

    const removeRipple = useCallback((id) => {
        setRipples((currentRipples) => currentRipples.filter((ripple) => ripple.id !== id));
    }, []);

    // Optionally, if you want to clear all ripples at once
    const clearRipples = useCallback(() => {
        setRipples([]);
    }, []);

    return { addRipple, clearRipples, removeRipple, ripples };
};

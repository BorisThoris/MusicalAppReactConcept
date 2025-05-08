import { useLayoutEffect, useState } from 'react';

/**
 * Returns the current pixels-per-second ratio for a timeline of `durationSec`.
 */
export function usePixelToSecondRatio(durationSec) {
    const [ratio, setRatio] = useState(() => window.innerWidth / durationSec);

    useLayoutEffect(() => {
        const update = () => {
            const newRatio = window.innerWidth / durationSec;
            console.log('window.innerWidth / durationSec', newRatio);
            setRatio(newRatio);
        };

        // update on mount / durationSec change
        update();

        // update on every resize
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [durationSec]);

    return ratio;
}

import { useEffect, useRef } from 'react';
import { playEventInstance } from '../fmodLogic';

const scheduleSoundPlayback = (sound, delay, playEventFunc) => {
    const timeoutId = setTimeout(
        () => {
            console.log(sound.eventName);
            // playEventFunc(sound.eventName);
        },
        // Transforming seconds to ms
        delay * 1000
    );
    return timeoutId;
};

const usePlayback = () => {
    const timeoutIds = useRef([]);

    const clearAllTimeouts = () => {
        timeoutIds.current.forEach(clearTimeout);
        timeoutIds.current = [];
    };

    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, []);

    return {
        clearAllTimeouts,
        scheduleSoundPlayback: (sound, delay) =>
            scheduleSoundPlayback(sound, delay, playEventInstance),
    };
};

export default usePlayback;

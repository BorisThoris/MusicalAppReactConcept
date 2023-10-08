import { useEffect, useRef } from 'react';

const scheduleSoundPlayback = ({ delay, playbackCallback }) => {
    const timeoutId = setTimeout(() => {
        playbackCallback();
    }, delay * 1000);

    return delay * 1000;
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
        scheduleSoundPlayback,
    };
};

export default usePlayback;

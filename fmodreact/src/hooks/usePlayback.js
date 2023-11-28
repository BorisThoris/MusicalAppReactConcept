import { useCallback, useEffect, useState } from 'react';

const usePlayback = ({ playbackStatus }) => {
    const [timeouts, setTimeouts] = useState([]);

    const clearAllTimeouts = useCallback(() => {
        timeouts.forEach(clearTimeout);

        setTimeouts([]);
    }, [timeouts]);

    const setNewTimeout = useCallback((callback, delay) => {
        const timeoutId = setTimeout(() => callback(), delay * 1000);

        setTimeouts((prevTimeouts) => {
            return [...prevTimeouts, timeoutId];
        });
    }, []);

    useEffect(() => {
        if (timeouts.length > 0 && !playbackStatus) {
            clearAllTimeouts();
        }
    }, [clearAllTimeouts, playbackStatus, timeouts.length]);

    return { clearAllTimeouts, setNewTimeout };
};

export default usePlayback;

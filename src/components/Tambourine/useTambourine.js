import { useCallback, useEffect, useState } from 'react';

const useTambourine = ({ playEvent }) => {
    const [soundPlayed, setSoundPlayed] = useState(false);
    const [wasPositive, setWasPositive] = useState(false);

    const handleMotion = useCallback(
        (event) => {
            const xAccel = event.rotationRate.beta * 10;
            if (soundPlayed) {
                if (xAccel < -3 && wasPositive) {
                    setSoundPlayed(false);
                }
                if (xAccel > 3 && !wasPositive) {
                    setSoundPlayed(false);
                }
            } else if (xAccel > 15 && !soundPlayed) {
                playEvent();
                setSoundPlayed(true);
                setWasPositive(true);
            }
        },
        [playEvent, soundPlayed, wasPositive]
    );

    useEffect(() => {
        window.addEventListener('devicemotion', handleMotion);
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
        };
    }, [handleMotion, soundPlayed, wasPositive]);
};

export default useTambourine;

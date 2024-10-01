import React, { useEffect, useRef, useState } from 'react';

const styles = {
    fpsContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '5px',
        padding: '10px',
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 1000
    },
    fpsText: {
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        margin: 0
    }
};

const FPSMonitor = () => {
    const [fps, setFps] = useState(0);
    const frames = useRef([]);
    const lastFrameTime = useRef(performance.now());

    useEffect(() => {
        const calculateFPS = () => {
            const now = performance.now();
            const delta = now - lastFrameTime.current;
            const fpsNow = 1000 / delta;

            frames.current.push(fpsNow);
            lastFrameTime.current = now;

            if (frames.current.length > 60) {
                frames.current.shift(); // Keep the last 60 frames
            }

            const averageFPS = frames.current.reduce((acc, frame) => acc + frame, 0) / frames.current.length;

            setFps(Math.round(averageFPS));

            requestAnimationFrame(calculateFPS);
        };

        const animationId = requestAnimationFrame(calculateFPS);

        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div style={styles.fpsContainer}>
            <p style={styles.fpsText}>FPS: {fps}</p>
        </div>
    );
};

export default FPSMonitor;

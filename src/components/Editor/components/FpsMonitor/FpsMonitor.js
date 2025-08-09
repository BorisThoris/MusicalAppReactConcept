import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const FpsContainer = styled.div`
    background-color: ${({ theme }) => theme.colors.semantic.background.overlay};
    border-radius: ${({ theme }) => theme.borderRadius.base};
    padding: ${({ theme }) => theme.spacing[2]};
    position: fixed;
    right: 0;
    top: 0;
    z-index: ${({ theme }) => theme.zIndex.dropdown};
`;

const FpsText = styled.p`
    color: ${({ theme }) => theme.colors.semantic.text.inverse};
    font-family: ${({ theme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    margin: 0;
`;

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
        <FpsContainer>
            <FpsText>FPS: {fps}</FpsText>
        </FpsContainer>
    );
};

export default FPSMonitor;

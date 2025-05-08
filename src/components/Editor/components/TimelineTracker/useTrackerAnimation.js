import { useCallback, useEffect, useRef } from 'react';
import pixelToSecondRatio from '../../../../globalConstants/pixelToSeconds';

export const useTrackerAnimation = (
    trackerRef,
    trackerPosition,
    playbackStatus,
    totalDurationInPixels,
    changePlaybackStatus,
    playCollidedElements,
    resetTrackerPosition
) => {
    const animationRef = useRef(null);

    const startTimeRef = useRef(null);
    const initialPosRef = useRef(0);

    useEffect(() => {
        if (!playbackStatus.isPlaying) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            startTimeRef.current = null;
        }
    }, [playbackStatus.isPlaying]);

    const moveTracker = useCallback(() => {
        if (!trackerRef.current) return;

        // On start/resume, capture now + where we began
        if (startTimeRef.current === null) {
            startTimeRef.current = performance.now();
            initialPosRef.current = trackerPosition;
        }

        const animate = (currentTime) => {
            if (!trackerRef.current || !playbackStatus.isPlaying) return;

            // elapsed seconds since start
            const elapsedSeconds = (currentTime - startTimeRef.current) / 1000;
            const newPos = Math.min(initialPosRef.current + elapsedSeconds * pixelToSecondRatio, totalDurationInPixels);

            trackerRef.current.x(newPos);
            playCollidedElements();

            if (newPos < totalDurationInPixels) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                changePlaybackStatus(false);
                resetTrackerPosition();
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [
        trackerRef,
        trackerPosition,
        playbackStatus.isPlaying,
        totalDurationInPixels,
        playCollidedElements,
        changePlaybackStatus,
        resetTrackerPosition
    ]);

    return { animationRef, moveTracker };
};

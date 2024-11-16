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

    useEffect(() => {
        if (!playbackStatus.isPlaying) {
            cancelAnimationFrame(animationRef.current);
        }
    }, [playbackStatus.isPlaying]);

    const moveTracker = useCallback(() => {
        if (!trackerRef.current) return;

        const startTimestamp = performance.now() - trackerPosition / pixelToSecondRatio;

        const animate = (currentTime) => {
            if (!trackerRef.current || !playbackStatus.isPlaying) return;

            const elapsedTime = (currentTime - startTimestamp) / 1000;
            const newTrackerPosition = Math.min(
                trackerPosition + elapsedTime * pixelToSecondRatio,
                totalDurationInPixels
            );

            trackerRef.current.x(newTrackerPosition);
            playCollidedElements();

            if (newTrackerPosition < totalDurationInPixels) {
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

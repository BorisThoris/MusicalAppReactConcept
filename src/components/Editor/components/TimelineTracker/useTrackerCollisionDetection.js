import { useCallback, useRef } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useCollisionDetection = (trackerRef, processedElements, mutedInstruments, playbackStatus) => {
    const playedInstancesRef = useRef(new Set());

    const haveIntersection = useCallback((r1, r2) => {
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }, []);

    const playCollidedElements = useCallback(() => {
        if (!playbackStatus.isPlaying || !trackerRef.current) return;

        const trackerRect = trackerRef.current.getClientRect();

        let hasCollided = false;

        processedElements.forEach(({ element, recording }) => {
            const elementRect = element.getClientRect();
            const { eventInstance, instrumentName } = recording;

            const shouldPlay =
                haveIntersection(trackerRect, elementRect) &&
                !mutedInstruments.includes(instrumentName) &&
                !playedInstancesRef.current.has(eventInstance);

            const shouldStop =
                !haveIntersection(trackerRect, elementRect) && playedInstancesRef.current.has(eventInstance);

            if (shouldPlay) {
                playEventInstance(eventInstance);
                playedInstancesRef.current.add(eventInstance);
                hasCollided = true;
            } else if (shouldStop) {
                playedInstancesRef.current.delete(eventInstance);
            }
        });
    }, [trackerRef, processedElements, mutedInstruments, playbackStatus, haveIntersection]);

    return { haveIntersection, playCollidedElements };
};

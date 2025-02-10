import { useCallback, useRef } from 'react';
import { playEventInstance } from '../../../../fmodLogic/eventInstanceHelpers';

export const useCollisionDetection = (trackerRef, processedItems, mutedInstruments, playbackStatus) => {
    const playedInstancesRef = useRef(new Set());

    const haveIntersection = useCallback((r1, r2) => {
        return !(
            r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y
        );
    }, []);

    const processItemCollision = useCallback(
        (clientRect, recording) => {
            if (!clientRect || !recording) return false;

            const trackerRect = trackerRef.current.getClientRect();
            const { eventInstance, instrumentName } = recording;

            const shouldPlay =
                haveIntersection(trackerRect, clientRect) &&
                !mutedInstruments.includes(instrumentName) &&
                !playedInstancesRef.current.has(eventInstance);

            const shouldStop =
                !haveIntersection(trackerRect, clientRect) && playedInstancesRef.current.has(eventInstance);

            if (shouldPlay) {
                playEventInstance(eventInstance);
                playedInstancesRef.current.add(eventInstance);
                return true;
            }
            if (shouldStop) {
                playedInstancesRef.current.delete(eventInstance);
            }

            return false;
        },
        [trackerRef, haveIntersection, mutedInstruments]
    );

    const playCollidedElements = useCallback(() => {
        if (!playbackStatus.isPlaying || !trackerRef.current) return;

        let hasCollided = false;

        processedItems.forEach(({ clientRect, groupData, recording, type }) => {
            if (type === 'element') {
                // Check standalone elements
                if (processItemCollision(clientRect, recording)) {
                    hasCollided = true;
                }
            }
        });
    }, [playbackStatus.isPlaying, trackerRef, processedItems, processItemCollision]);

    return { haveIntersection, playCollidedElements };
};
